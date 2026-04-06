using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;

namespace Mjolksyra.UseCases.PlannedWorkouts.ClarifyWorkoutPlan;

public class ClarifyWorkoutPlanQueryHandler(
    IAIWorkoutPlannerAgent plannerAgent,
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IWorkoutMediaAnalysisRepository workoutMediaAnalysisRepository,
    IExerciseRepository exerciseRepository,
    IPlannedWorkoutDeletedPublisher plannedWorkoutDeletedPublisher,
    IAIPlannerSessionRepository sessionRepository,
    ITraineeRepository traineeRepository,
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
            workoutMediaAnalysisRepository,
            exerciseRepository,
            plannedWorkoutDeletedPublisher,
            request.TraineeId);

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
        AIPlannerSession session;
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
            .Select(m => new AIPlannerSessionMessage { Role = m.Role, Content = m.Content })
            .Append(new AIPlannerSessionMessage
            {
                Role = "assistant",
                Content = output.Message,
                Options = output.Options.ToList(),
            })
            .ToList();

        session.SuggestedParams = output.IsReadyToGenerate ? output.SuggestedParams : null;

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
            WorkoutsChanged = loggingDispatcher.WorkoutsChanged || output.WorkoutsChanged,
            Options = output.Options,
            SuggestedParams = output.SuggestedParams is null ? null : new ClarifyWorkoutPlanSuggestedParams
            {
                StartDate = output.SuggestedParams.StartDate,
                NumberOfWeeks = output.SuggestedParams.NumberOfWeeks,
                ConflictStrategy = output.SuggestedParams.ConflictStrategy,
            },
        };
    }

    private static AIPlannerSession CreateSession(Guid traineeId, Guid coachUserId, string description, DateTimeOffset now)
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
