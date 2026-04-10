using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkout;

public class GetPlannedWorkoutRequestHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<GetPlannedWorkoutRequest, PlannedWorkoutResponse?>
{
    public async Task<PlannedWorkoutResponse?> Handle(GetPlannedWorkoutRequest request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        var isAthleteViewer = trainee is not null && trainee.AthleteUserId == userId;

        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (workout is null || workout.TraineeId != request.TraineeId)
        {
            return null;
        }

        // Athletes only see workouts that have published exercises
        if (isAthleteViewer && workout.PublishedExercises.Count == 0)
        {
            return null;
        }

        var exerciseIds = workout.PublishedExercises
            .Concat(workout.DraftExercises ?? [])
            .Select(x => x.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var exercises = await exerciseRepository.GetMany(exerciseIds, cancellationToken);

        var response = PlannedWorkoutResponse.From(workout, exercises);
        if (isAthleteViewer)
        {
            response.DraftExercises = null;
        }

        return response;
    }
}
