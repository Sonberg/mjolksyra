using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Coaches.ConsumeCredits;
using OneOf;
using ExerciseType = Mjolksyra.Domain.Database.Models.ExerciseType;

namespace Mjolksyra.UseCases.Blocks.Planner.ApplyBlockPlannerProposal;

public class ApplyBlockPlannerProposalCommandHandler(
    IMediator mediator,
    IBlockPlannerSessionRepository sessionRepository,
    IBlockRepository blockRepository,
    IExerciseRepository exerciseRepository,
    IUserContext userContext) : IRequestHandler<ApplyBlockPlannerProposalCommand, OneOf<ApplyBlockPlannerProposalResponse, ApplyBlockPlannerProposalForbidden, ApplyBlockPlannerProposalInsufficientCredits>>
{
    public async Task<OneOf<ApplyBlockPlannerProposalResponse, ApplyBlockPlannerProposalForbidden, ApplyBlockPlannerProposalInsufficientCredits>> Handle(
        ApplyBlockPlannerProposalCommand request,
        CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return new ApplyBlockPlannerProposalForbidden();
        }

        var block = await blockRepository.Get(request.BlockId, cancellationToken);
        if (block is null || block.CoachId != userId)
        {
            return new ApplyBlockPlannerProposalForbidden();
        }

        var session = await sessionRepository.GetByProposalId(request.ProposalId, userId, cancellationToken);
        if (session is null || session.BlockId != request.BlockId)
        {
            return new ApplyBlockPlannerProposalForbidden();
        }

        var proposal = session.ProposedActionSet;
        if (proposal is null || proposal.Id != request.ProposalId || proposal.Status != AIPlannerProposalStatus.Pending)
        {
            return new ApplyBlockPlannerProposalForbidden();
        }

        if (proposal.CreditCost <= 0 && proposal.Actions.Count > 0)
        {
            var pricing = AIPlannerProposalPricing.Calculate(
                proposal.Actions.Select(a => new AIPlannerActionProposal
                {
                    ActionType = a.ActionType,
                    Summary = a.Summary,
                }));
            proposal.CreditCost = pricing.CreditCost;
            proposal.CreditBreakdown = pricing.Breakdown;
        }

        var consumeResult = await mediator.Send(
            new ConsumeCreditsCommand(
                userId,
                CreditAction.GenerateBlockPlan,
                request.ProposalId.ToString(),
                proposal.CreditCost),
            cancellationToken);

        if (consumeResult.IsT1)
        {
            return new ApplyBlockPlannerProposalInsufficientCredits(consumeResult.AsT1.Reason);
        }

        var workouts = block.Workouts.ToList();
        var actionsApplied = 0;

        foreach (var action in proposal.Actions)
        {
            switch (action.ActionType)
            {
                case BlockPlannerProposalActionTypes.CreateBlockWorkout:
                    if (action.Workout is null) break;

                    var newWorkout = await BuildBlockWorkoutAsync(action.Workout, cancellationToken);
                    workouts.RemoveAll(w =>
                        w.Week == newWorkout.Week && w.DayOfWeek == newWorkout.DayOfWeek);
                    workouts.Add(newWorkout);
                    actionsApplied++;
                    break;

                case BlockPlannerProposalActionTypes.DeleteBlockWorkout:
                    var toDelete = action.TargetWorkoutId.HasValue
                        ? workouts.FirstOrDefault(w => w.Id == action.TargetWorkoutId.Value)
                        : (action.TargetWeek.HasValue && action.TargetDayOfWeek.HasValue
                            ? workouts.FirstOrDefault(w =>
                                w.Week == action.TargetWeek.Value &&
                                w.DayOfWeek == action.TargetDayOfWeek.Value)
                            : null);
                    if (toDelete is null) break;

                    workouts.Remove(toDelete);
                    actionsApplied++;
                    break;

                case BlockPlannerProposalActionTypes.UpdateBlockWorkout:
                    if (action.Workout is null) break;

                    var targetForUpdate = action.TargetWorkoutId.HasValue
                        ? workouts.FirstOrDefault(w => w.Id == action.TargetWorkoutId.Value)
                        : (action.TargetWeek.HasValue && action.TargetDayOfWeek.HasValue
                            ? workouts.FirstOrDefault(w =>
                                w.Week == action.TargetWeek.Value &&
                                w.DayOfWeek == action.TargetDayOfWeek.Value)
                            : null);
                    if (targetForUpdate is null) break;

                    var updatedWorkout = await BuildBlockWorkoutAsync(action.Workout, cancellationToken);
                    updatedWorkout.Id = targetForUpdate.Id;
                    workouts.Remove(targetForUpdate);
                    workouts.Add(updatedWorkout);
                    actionsApplied++;
                    break;

                case BlockPlannerProposalActionTypes.AddBlockExercise:
                    if (action.Workout is null) break;

                    var addTarget = action.TargetWorkoutId.HasValue
                        ? workouts.FirstOrDefault(w => w.Id == action.TargetWorkoutId.Value)
                        : (action.TargetWeek.HasValue && action.TargetDayOfWeek.HasValue
                            ? workouts.FirstOrDefault(w =>
                                w.Week == action.TargetWeek.Value &&
                                w.DayOfWeek == action.TargetDayOfWeek.Value)
                            : null);
                    if (addTarget is null) break;

                    var newExercises = await BuildExercisesAsync(action.Workout.Exercises, cancellationToken);
                    addTarget.Exercises = addTarget.Exercises.Concat(newExercises).ToList();
                    actionsApplied++;
                    break;

                case BlockPlannerProposalActionTypes.UpdateBlockExercise:
                    if (action.Workout is null) break;

                    var updateExTarget = action.TargetWorkoutId.HasValue
                        ? workouts.FirstOrDefault(w => w.Id == action.TargetWorkoutId.Value)
                        : (action.TargetWeek.HasValue && action.TargetDayOfWeek.HasValue
                            ? workouts.FirstOrDefault(w =>
                                w.Week == action.TargetWeek.Value &&
                                w.DayOfWeek == action.TargetDayOfWeek.Value)
                            : null);
                    if (updateExTarget is null) break;

                    var updatedExercises = await BuildExercisesAsync(action.Workout.Exercises, cancellationToken);
                    var exList = updateExTarget.Exercises.ToList();
                    foreach (var updated in updatedExercises)
                    {
                        var idx = exList.FindIndex(e => e.Id == updated.Id);
                        if (idx >= 0) exList[idx] = updated;
                        else exList.Add(updated);
                    }
                    updateExTarget.Exercises = exList;
                    actionsApplied++;
                    break;

                case BlockPlannerProposalActionTypes.DeleteBlockExercise:
                    var deleteExTarget = action.TargetWorkoutId.HasValue
                        ? workouts.FirstOrDefault(w => w.Id == action.TargetWorkoutId.Value)
                        : (action.TargetWeek.HasValue && action.TargetDayOfWeek.HasValue
                            ? workouts.FirstOrDefault(w =>
                                w.Week == action.TargetWeek.Value &&
                                w.DayOfWeek == action.TargetDayOfWeek.Value)
                            : null);
                    if (deleteExTarget is null) break;

                    if (action.TargetExerciseId.HasValue)
                    {
                        deleteExTarget.Exercises = deleteExTarget.Exercises
                            .Where(e => e.Id != action.TargetExerciseId.Value)
                            .ToList();
                        actionsApplied++;
                    }
                    else if (action.Workout?.Exercises.Count > 0)
                    {
                        var idsToDelete = action.Workout.Exercises
                            .Where(e => e.Id.HasValue)
                            .Select(e => e.Id!.Value)
                            .ToHashSet();
                        deleteExTarget.Exercises = deleteExTarget.Exercises
                            .Where(e => !idsToDelete.Contains(e.Id))
                            .ToList();
                        actionsApplied++;
                    }
                    break;
            }
        }

        block.Workouts = workouts;
        await blockRepository.Update(block, cancellationToken);

        proposal.Status = AIPlannerProposalStatus.Applied;
        proposal.AppliedAt = DateTimeOffset.UtcNow;
        session.UpdatedAt = DateTimeOffset.UtcNow;
        await sessionRepository.Update(session, cancellationToken);

        return new ApplyBlockPlannerProposalResponse
        {
            SessionId = session.Id,
            ProposalId = proposal.Id,
            ActionsApplied = actionsApplied,
            Summary = proposal.Summary,
        };
    }

    private async Task<BlockWorkout> BuildBlockWorkoutAsync(
        BlockWorkoutRequestPayload payload,
        CancellationToken cancellationToken)
    {
        return new BlockWorkout
        {
            Id = Guid.NewGuid(),
            Week = payload.Week,
            DayOfWeek = payload.DayOfWeek,
            Name = payload.Name,
            Note = payload.Note,
            Exercises = await BuildExercisesAsync(payload.Exercises, cancellationToken),
        };
    }

    private async Task<List<BlockExercise>> BuildExercisesAsync(
        ICollection<PlannedExerciseRequestPayload> exercises,
        CancellationToken cancellationToken)
    {
        return (await Task.WhenAll(exercises.Select(async exercise =>
        {
            var exerciseType = exercise.PrescriptionType switch
            {
                "DurationSeconds" => ExerciseType.DurationSeconds,
                "DistanceMeters" => ExerciseType.DistanceMeters,
                _ => ExerciseType.SetsReps,
            };

            Exercise? resolved = null;
            if (exercise.ExerciseId.HasValue)
            {
                var existing = await exerciseRepository.GetMany([exercise.ExerciseId.Value], cancellationToken);
                resolved = existing.FirstOrDefault();
            }

            if (resolved is null)
            {
                var found = await exerciseRepository.Search(exercise.Name.Trim(), [], [], null, cancellationToken);
                resolved = found.FirstOrDefault(x =>
                    string.Equals(x.Name.Trim(), exercise.Name.Trim(), StringComparison.OrdinalIgnoreCase));
            }

            return new BlockExercise
            {
                Id = exercise.Id ?? Guid.NewGuid(),
                ExerciseId = resolved?.Id ?? exercise.ExerciseId,
                Name = exercise.Name,
                Note = exercise.Note,
                Prescription = exercise.Sets.Count == 0 ? null : new ExercisePrescription
                {
                    Type = exerciseType,
                    Sets = exercise.Sets.Select(s => new ExercisePrescriptionSet
                    {
                        Target = new ExercisePrescriptionSetTarget
                        {
                            Reps = s.Reps,
                            WeightKg = s.WeightKg,
                            DurationSeconds = s.DurationSeconds,
                            DistanceMeters = s.DistanceMeters,
                            Note = s.Note,
                        },
                        Actual = null,
                    }).ToList(),
                },
            };
        }))).ToList();
    }
}
