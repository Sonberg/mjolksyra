using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;
using Mjolksyra.UseCases.PlannedWorkouts.PreviewWorkoutPlan;

namespace Mjolksyra.UseCases.PlannedWorkouts.ClarifyWorkoutPlan;

public class ClarifyWorkoutPlanQueryHandler(
    IAIWorkoutPlannerAgent plannerAgent,
    IPlannedWorkoutRepository plannedWorkoutRepository,
    ICompletedWorkoutRepository completedWorkoutRepository,
    IWorkoutMediaAnalysisRepository workoutMediaAnalysisRepository,
    IExerciseRepository exerciseRepository,
    IPlannedWorkoutDeletedPublisher plannedWorkoutDeletedPublisher,
    IPlannerSessionRepository sessionRepository,
    ITraineeRepository traineeRepository,
    ITraineeInsightsRepository traineeInsightsRepository,
    ICoachInsightsRepository coachInsightsRepository,
    IUserContext userContext) : IRequestHandler<ClarifyWorkoutPlanQuery, ClarifyWorkoutPlanResponse?>
{
    public async Task<ClarifyWorkoutPlanResponse?> Handle(ClarifyWorkoutPlanQuery request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return null;
        }

        var innerDispatcher = new AIPlannerToolDispatcher(
            plannedWorkoutRepository,
            completedWorkoutRepository,
            workoutMediaAnalysisRepository,
            exerciseRepository,
            plannedWorkoutDeletedPublisher,
            traineeInsightsRepository,
            coachInsightsRepository,
            request.TraineeId,
            userId);

        var loggingDispatcher = new LoggingAIPlannerToolDispatcher(innerDispatcher);

        var output = await plannerAgent.ClarifyAsync(new AIPlannerClarifyInput
        {
            Description = request.Description,
            FilesContent = request.FilesContent,
            ConversationHistory = request.ConversationHistory,
            ToolDispatcher = loggingDispatcher,
        }, cancellationToken);

        var now = DateTimeOffset.UtcNow;

        // Load existing session or create a new one
        PlannerSession session;
        if (request.SessionId.HasValue)
        {
            session = await sessionRepository.GetById(request.SessionId.Value, cancellationToken)
                      ?? CreateSession(request.TraineeId, userId, request.Description, now);

            if (session.Id != Guid.Empty &&
                (session.TraineeId != request.TraineeId || session.CoachUserId != userId))
            {
                return null;
            }
        }
        else
        {
            session = CreateSession(request.TraineeId, userId, request.Description, now);
        }

        // Sync conversation history from request + new AI turn
        session.ConversationHistory = request.ConversationHistory
            .Select(m => new PlannerSessionMessage { Role = m.Role, Content = m.Content })
            .Append(new PlannerSessionMessage
            {
                Role = "assistant",
                Content = output.Message,
                Options = output.Options.ToList(),
            })
            .ToList();

        session.SuggestedParams = output.IsReadyToGenerate ? output.SuggestedParams : null;
        session.PreviewWorkouts = output.PreviewWorkouts;
        session.ProposedActionSet = await NormalizeProposalAsync(
            request.TraineeId,
            output.ProposedActionSet,
            now,
            cancellationToken);

        // Append any new tool calls from this turn
        foreach (var call in loggingDispatcher.Calls)
        {
            session.ToolCalls.Add(call);
        }

        session.UpdatedAt = now;

        if (session.Id == Guid.Empty)
        {
            session.Id = Guid.NewGuid();
            await sessionRepository.Create(session, cancellationToken);
        }
        else
        {
            await sessionRepository.Update(session, cancellationToken);
        }

        return new ClarifyWorkoutPlanResponse
        {
            SessionId = session.Id,
            Message = output.Message,
            IsReadyToGenerate = output.IsReadyToGenerate,
            IsReadyToApply = output.IsReadyToApply && session.ProposedActionSet is not null,
            RequiresApproval = output.RequiresApproval || session.ProposedActionSet is not null,
            Options = output.Options,
            SuggestedParams = output.SuggestedParams is null ? null : new ClarifyWorkoutPlanSuggestedParams
            {
                StartDate = output.SuggestedParams.StartDate,
                NumberOfWeeks = output.SuggestedParams.NumberOfWeeks,
                ConflictStrategy = output.SuggestedParams.ConflictStrategy,
            },
            ProposedActionSet = session.ProposedActionSet,
            PreviewWorkouts = PreviewWorkoutPlanMapper.FromOutputs(session.PreviewWorkouts),
        };
    }

    private async Task<AIPlannerActionSet?> NormalizeProposalAsync(
        Guid traineeId,
        AIPlannerActionSet? proposedActionSet,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        if (proposedActionSet is null || proposedActionSet.Actions.Count == 0)
        {
            return null;
        }

        var normalized = new AIPlannerActionSet
        {
            Id = Guid.NewGuid(),
            Status = AIPlannerProposalStatus.Pending,
            Summary = proposedActionSet.Summary,
            Explanation = proposedActionSet.Explanation,
            CreatedAt = now,
            Actions = proposedActionSet.Actions.Select(action => new AIPlannerActionProposal
            {
                ActionType = action.ActionType,
                Summary = action.Summary,
                TargetWorkoutId = action.TargetWorkoutId,
                TargetExerciseId = action.TargetExerciseId,
                TargetDate = action.TargetDate ?? action.Workout?.PlannedAt,
                PreviousDate = action.PreviousDate,
                Workout = action.Workout,
            }).ToList(),
        };

        var workoutsById = await ResolveTargetWorkoutsAsync(normalized.Actions, cancellationToken);

        normalized.Actions = normalized.Actions
            .Where(action =>
            {
                if (action.ActionType != AIPlannerProposalActionTypes.DeleteWorkout || !action.TargetWorkoutId.HasValue)
                {
                    return true;
                }

                return !workoutsById.TryGetValue(action.TargetWorkoutId.Value, out var workout) || workout.PlannedAt >= DateOnly.FromDateTime(DateTime.UtcNow);
            })
            .ToList();

        foreach (var action in normalized.Actions.Where(a => a.TargetWorkoutId.HasValue))
        {
            if (!workoutsById.TryGetValue(action.TargetWorkoutId!.Value, out var workout))
            {
                continue;
            }

            action.TargetDate ??= workout.PlannedAt.ToString("yyyy-MM-dd");
            action.BeforeStateFingerprint = AIPlannerProposalFingerprint.ComputeWorkoutFingerprint(workout);
        }

        if (normalized.Actions.Count == 0)
        {
            return null;
        }

        var pricing = AIPlannerProposalPricing.Calculate(normalized.Actions);
        normalized.CreditCost = pricing.CreditCost;
        normalized.CreditBreakdown = pricing.Breakdown;

        var affectedDates = normalized.Actions
            .SelectMany(action => new[] { action.TargetDate, action.PreviousDate, action.Workout?.PlannedAt })
            .Where(date => DateOnly.TryParse(date, out _))
            .Select(date => DateOnly.Parse(date!))
            .ToList();

        if (affectedDates.Count == 0)
        {
            affectedDates.Add(DateOnly.FromDateTime(DateTime.UtcNow));
        }

        normalized.AffectedDateFrom = affectedDates.Min().ToString("yyyy-MM-dd");
        normalized.AffectedDateTo = affectedDates.Max().ToString("yyyy-MM-dd");

        var existing = await plannedWorkoutRepository.Get(new Domain.Database.Common.PlannedWorkoutCursor
        {
            TraineeId = traineeId,
            FromDate = DateOnly.Parse(normalized.AffectedDateFrom),
            ToDate = DateOnly.Parse(normalized.AffectedDateTo),
            SortBy = ["plannedAt"],
            Order = SortOrder.Asc,
            DraftOnly = false,
            Size = 200,
            Page = 0,
        }, cancellationToken);

        normalized.SourceSnapshotHash = AIPlannerProposalFingerprint.ComputeWorkoutsFingerprint(existing.Data);

        return normalized;
    }

    private async Task<Dictionary<Guid, PlannedWorkout>> ResolveTargetWorkoutsAsync(
        IEnumerable<AIPlannerActionProposal> actions,
        CancellationToken cancellationToken)
    {
        var workoutIds = actions
            .Where(action => action.TargetWorkoutId.HasValue)
            .Select(action => action.TargetWorkoutId!.Value)
            .Distinct()
            .ToList();

        if (workoutIds.Count == 0)
        {
            return [];
        }

        var resolved = await Task.WhenAll(workoutIds.Select(async workoutId =>
        {
            try
            {
                return await plannedWorkoutRepository.Get(workoutId, cancellationToken);
            }
            catch
            {
                return null;
            }
        }));

        return resolved
            .Where(workout => workout is not null)
            .ToDictionary(workout => workout!.Id, workout => workout!);
    }

    private static PlannerSession CreateSession(Guid traineeId, Guid coachUserId, string description, DateTimeOffset now)
        => new()
        {
            Id = Guid.Empty, // signals "not yet persisted"
            TraineeId = traineeId,
            CoachUserId = coachUserId,
            Description = description,
            CreatedAt = now,
            UpdatedAt = now,
        };
}
