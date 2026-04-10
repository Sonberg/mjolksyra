using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Coaches.ConsumeCredits;
using Mjolksyra.UseCases.PlannedWorkouts.CreatePlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.DeletePlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.UpdateDraftExercises;
using OneOf;

namespace Mjolksyra.UseCases.PlannedWorkouts.ApplyAIPlannerProposal;

public class ApplyAIPlannerProposalCommandHandler(
    IMediator mediator,
    IPlannerSessionRepository sessionRepository,
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<ApplyAIPlannerProposalCommand, OneOf<ApplyAIPlannerProposalResponse, ApplyAIPlannerProposalForbidden, ApplyAIPlannerProposalConflict, ApplyAIPlannerProposalInsufficientCredits>>
{
    public async Task<OneOf<ApplyAIPlannerProposalResponse, ApplyAIPlannerProposalForbidden, ApplyAIPlannerProposalConflict, ApplyAIPlannerProposalInsufficientCredits>> Handle(
        ApplyAIPlannerProposalCommand request,
        CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return new ApplyAIPlannerProposalForbidden();
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return new ApplyAIPlannerProposalForbidden();
        }

        var session = await sessionRepository.GetByProposalId(request.ProposalId, userId, cancellationToken);
        if (session is null || session.TraineeId != request.TraineeId)
        {
            return new ApplyAIPlannerProposalForbidden();
        }

        var proposal = session.ProposedActionSet;
        if (proposal is null || proposal.Id != request.ProposalId || proposal.Status != AIPlannerProposalStatus.Pending)
        {
            return new ApplyAIPlannerProposalConflict("This proposal is no longer pending.");
        }

        if (proposal.CreditCost <= 0 && proposal.Actions.Count > 0)
        {
            var pricing = AIPlannerProposalPricing.Calculate(proposal.Actions);
            proposal.CreditCost = pricing.CreditCost;
            proposal.CreditBreakdown = pricing.Breakdown;
        }

        // Only fetch and validate existing workouts when the proposal targets them.
        // Pure create_workout proposals have no targetWorkoutId and cannot conflict with
        // existing state, so the snapshot check is skipped for those.
        var hasTargetedActions = proposal.Actions.Any(a => a.TargetWorkoutId.HasValue);

        Paginated<PlannedWorkout> currentWorkouts = new() { Data = [] };
        if (hasTargetedActions)
        {
            if (!DateOnly.TryParse(proposal.AffectedDateFrom, out var fromDate) ||
                !DateOnly.TryParse(proposal.AffectedDateTo, out var toDate))
            {
                return new ApplyAIPlannerProposalConflict("This proposal is missing its date range.");
            }

            currentWorkouts = await plannedWorkoutRepository.Get(new PlannedWorkoutCursor
            {
                TraineeId = request.TraineeId,
                FromDate = fromDate,
                ToDate = toDate,
                SortBy = ["plannedAt"],
                Order = SortOrder.Asc,
                DraftOnly = false,
                Size = 200,
                Page = 0,
            }, cancellationToken);

            var currentSnapshotHash = AIPlannerProposalFingerprint.ComputeWorkoutsFingerprint(currentWorkouts.Data);
            if (!string.Equals(proposal.SourceSnapshotHash, currentSnapshotHash, StringComparison.Ordinal))
            {
                return new ApplyAIPlannerProposalConflict("Planner state changed after this proposal was generated. Please ask the assistant to refresh the proposal.");
            }
        }

        var consumeResult = await mediator.Send(
            new ConsumeCreditsCommand(
                userId,
                CreditAction.GenerateWorkoutPlan,
                request.ProposalId.ToString(),
                proposal.CreditCost),
            cancellationToken);

        if (consumeResult.IsT1)
        {
            return new ApplyAIPlannerProposalInsufficientCredits(consumeResult.AsT1.Reason);
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var resolvedExercises = new Dictionary<string, Exercise>(StringComparer.OrdinalIgnoreCase);
        var changedWorkoutIds = new List<Guid>();
        var actionsApplied = 0;

        foreach (var action in proposal.Actions)
        {
            switch (action.ActionType)
            {
                case AIPlannerProposalActionTypes.CreateWorkout:
                    // Skip creates that have no workout data (LLM omitted the payload).
                    if (action.Workout is null) break;

                    var (createMetadata, createExercises) = await BuildWorkoutRequestAsync(action.Workout, userId, resolvedExercises, cancellationToken);
                    var created = await mediator.Send(new CreatePlannedWorkoutCommand
                    {
                        TraineeId = request.TraineeId,
                        Workout = createMetadata,
                    }, cancellationToken);
                    await mediator.Send(new UpdateDraftExercisesCommand
                    {
                        TraineeId = request.TraineeId,
                        PlannedWorkoutId = created.Id,
                        Exercises = createExercises,
                    }, cancellationToken);
                    changedWorkoutIds.Add(created.Id);
                    actionsApplied++;
                    break;

                case AIPlannerProposalActionTypes.DeleteWorkout:
                    // Skip if the LLM gave a missing or unresolvable target ID.
                    if (!action.TargetWorkoutId.HasValue) break;

                    var workoutToDelete = currentWorkouts.Data.FirstOrDefault(x => x.Id == action.TargetWorkoutId.Value);
                    // Skip if the workout is already gone or is in the past.
                    if (workoutToDelete is null || workoutToDelete.PlannedAt < today) break;

                    await mediator.Send(new DeletePlannedWorkoutCommand
                    {
                        TraineeId = request.TraineeId,
                        PlannedWorkoutId = action.TargetWorkoutId.Value,
                    }, cancellationToken);
                    changedWorkoutIds.Add(action.TargetWorkoutId.Value);
                    actionsApplied++;
                    break;

                case AIPlannerProposalActionTypes.UpdateWorkout:
                case AIPlannerProposalActionTypes.MoveWorkout:
                case AIPlannerProposalActionTypes.AddExercise:
                case AIPlannerProposalActionTypes.UpdateExercise:
                case AIPlannerProposalActionTypes.DeleteExercise:
                    // Skip if the LLM gave a missing/unresolvable target ID or omitted the workout payload.
                    if (!action.TargetWorkoutId.HasValue || action.Workout is null) break;

                    var targetWorkout = currentWorkouts.Data.FirstOrDefault(x => x.Id == action.TargetWorkoutId.Value);
                    // Skip if the workout is already gone or is in the past.
                    if (targetWorkout is null || targetWorkout.PlannedAt < today) break;

                    // Skip if the workout changed since the proposal was staged (stale fingerprint).
                    if (!string.Equals(action.BeforeStateFingerprint, AIPlannerProposalFingerprint.ComputeWorkoutFingerprint(targetWorkout), StringComparison.Ordinal)) break;

                    var (updateMetadata, updateExercises) = await BuildWorkoutRequestAsync(action.Workout, userId, resolvedExercises, cancellationToken);
                    var updated = await mediator.Send(new UpdatePlannedWorkoutCommand
                    {
                        TraineeId = request.TraineeId,
                        PlannedWorkoutId = action.TargetWorkoutId.Value,
                        Workout = updateMetadata,
                    }, cancellationToken);
                    await mediator.Send(new UpdateDraftExercisesCommand
                    {
                        TraineeId = request.TraineeId,
                        PlannedWorkoutId = action.TargetWorkoutId.Value,
                        Exercises = updateExercises,
                    }, cancellationToken);

                    if (updated is not null)
                    {
                        changedWorkoutIds.Add(updated.Id);
                        actionsApplied++;
                    }
                    break;

                default:
                    break;
            }
        }

        proposal.Status = AIPlannerProposalStatus.Applied;
        proposal.AppliedAt = DateTimeOffset.UtcNow;
        session.GenerationResult = new PlannerSessionGenerationResult
        {
            ActionsApplied = proposal.Actions.Count,
            Summary = proposal.Summary,
            DateFrom = proposal.AffectedDateFrom ?? string.Empty,
            DateTo = proposal.AffectedDateTo ?? string.Empty,
            GeneratedAt = DateTimeOffset.UtcNow,
        };
        session.UpdatedAt = DateTimeOffset.UtcNow;
        await sessionRepository.Update(session, cancellationToken);

        return new ApplyAIPlannerProposalResponse
        {
            SessionId = session.Id,
            ProposalId = proposal.Id,
            ActionsApplied = actionsApplied,
            Summary = proposal.Summary,
            WorkoutIds = changedWorkoutIds.Distinct().ToList(),
        };
    }

    private async Task<(PlannedWorkoutRequest Metadata, ICollection<PlannedExerciseRequest> Exercises)> BuildWorkoutRequestAsync(
        PlannedWorkoutRequestPayload workout,
        Guid createdByUserId,
        IDictionary<string, Exercise> resolvedExercises,
        CancellationToken cancellationToken)
    {
        var exercises = (await Task.WhenAll(workout.Exercises.Select(async exercise =>
        {
            var exerciseType = exercise.PrescriptionType switch
            {
                "DurationSeconds" => ExerciseType.DurationSeconds,
                "DistanceMeters" => ExerciseType.DistanceMeters,
                _ => ExerciseType.SetsReps,
            };

            var resolved = exercise.ExerciseId.HasValue
                ? await ResolveExistingExerciseAsync(exercise.ExerciseId.Value, exercise.Name, exerciseType, createdByUserId, resolvedExercises, cancellationToken)
                : await ResolveExerciseAsync(exercise.Name, exerciseType, createdByUserId, resolvedExercises, cancellationToken);

            return new PlannedExerciseRequest
            {
                Id = exercise.Id ?? Guid.NewGuid(),
                ExerciseId = resolved.Id,
                Name = exercise.Name,
                Note = exercise.Note,
                IsPublished = false,
                AddedBy = ExerciseAddedBy.Coach,
                Prescription = exercise.Sets.Count == 0
                    ? null
                    : new PlannedExercisePrescriptionRequest
                    {
                        Type = exerciseType,
                        Sets = exercise.Sets.Select(set => new ExercisePrescriptionSetRequest
                        {
                            Target = new ExercisePrescriptionSetTargetRequest
                            {
                                Reps = set.Reps,
                                WeightKg = set.WeightKg,
                                DurationSeconds = set.DurationSeconds,
                                DistanceMeters = set.DistanceMeters,
                                Note = set.Note,
                            },
                        }).ToList(),
                    },
            };
        }))).ToList();

        return (new PlannedWorkoutRequest
        {
            Name = workout.Name,
            Note = workout.Note,
            PlannedAt = DateOnly.Parse(workout.PlannedAt),
        }, exercises);
    }

    private async Task<Exercise> ResolveExistingExerciseAsync(
        Guid exerciseId,
        string fallbackName,
        ExerciseType exerciseType,
        Guid createdByUserId,
        IDictionary<string, Exercise> resolvedExercises,
        CancellationToken cancellationToken)
    {
        var existing = await exerciseRepository.GetMany([exerciseId], cancellationToken);
        return existing.FirstOrDefault() ??
               await ResolveExerciseAsync(fallbackName, exerciseType, createdByUserId, resolvedExercises, cancellationToken);
    }

    private async Task<Exercise> ResolveExerciseAsync(
        string exerciseName,
        ExerciseType exerciseType,
        Guid createdByUserId,
        IDictionary<string, Exercise> resolvedExercises,
        CancellationToken cancellationToken)
    {
        var normalizedName = exerciseName.Trim();
        if (resolvedExercises.TryGetValue(normalizedName, out var cached))
        {
            return cached;
        }

        var existing = await exerciseRepository.Search(normalizedName, [], [], null, cancellationToken);
        var resolved = existing.FirstOrDefault(x =>
                           string.Equals(x.Name.Trim(), normalizedName, StringComparison.OrdinalIgnoreCase) &&
                           x.Type == exerciseType)
                       ?? existing.FirstOrDefault(x =>
                           string.Equals(x.Name.Trim(), normalizedName, StringComparison.OrdinalIgnoreCase));

        if (resolved is null)
        {
            resolved = await exerciseRepository.Create(new Exercise
            {
                Id = Guid.NewGuid(),
                Name = normalizedName,
                Type = exerciseType,
                CreatedBy = createdByUserId,
                CreatedAt = DateTimeOffset.UtcNow,
            }, cancellationToken);
        }

        resolvedExercises[normalizedName] = resolved;
        return resolved;
    }
}
