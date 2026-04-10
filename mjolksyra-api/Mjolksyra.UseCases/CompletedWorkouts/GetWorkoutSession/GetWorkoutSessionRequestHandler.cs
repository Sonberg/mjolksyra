using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.CompletedWorkouts.GetWorkoutSession;

public class GetWorkoutSessionRequestHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    ICompletedWorkoutRepository completedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<GetWorkoutSessionRequest, WorkoutResponse?>
{
    public async Task<WorkoutResponse?> Handle(GetWorkoutSessionRequest request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        PlannedWorkout? plannedWorkout;
        CompletedWorkout? session;

        // Step 1: try resolving {id} as a CompletedWorkout.Id
        var completedWorkout = await completedWorkoutRepository.GetById(request.Id, cancellationToken);
        if (completedWorkout is not null && completedWorkout.TraineeId == request.TraineeId)
        {
            session = completedWorkout;
            plannedWorkout = await plannedWorkoutRepository.Get(completedWorkout.PlannedWorkoutId, cancellationToken);
        }
        else
        {
            // Step 2: try resolving {id} as a PlannedWorkout.Id
            plannedWorkout = await plannedWorkoutRepository.Get(request.Id, cancellationToken);
            if (plannedWorkout is null || plannedWorkout.TraineeId != request.TraineeId)
            {
                return null;
            }

            session = await completedWorkoutRepository.GetByPlannedWorkoutId(request.Id, cancellationToken);
        }

        if (plannedWorkout is null)
        {
            return null;
        }

        var planExerciseIds = plannedWorkout.PublishedExercises
            .Concat(plannedWorkout.DraftExercises ?? [])
            .Select(e => e.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var sessionExerciseIds = session?.Exercises
            .Select(e => e.ExerciseId)
            .OfType<Guid>()
            .ToList() ?? [];

        var allIds = planExerciseIds.Union(sessionExerciseIds).ToList();
        var masterExercises = await exerciseRepository.GetMany(allIds, cancellationToken);

        return WorkoutResponse.From(plannedWorkout, session, masterExercises, masterExercises);
    }
}
