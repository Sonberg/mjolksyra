using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.PublishDraftExercises;

public class PublishDraftExercisesCommandHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<PublishDraftExercisesCommand, PlannedWorkoutResponse?>
{
    public async Task<PlannedWorkoutResponse?> Handle(PublishDraftExercisesCommand request, CancellationToken cancellationToken)
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

        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (workout is null || workout.TraineeId != request.TraineeId)
        {
            return null;
        }

        if (workout.DraftExercises is null)
        {
            return PlannedWorkoutResponse.From(workout, []);
        }

        foreach (var exercise in workout.DraftExercises)
        {
            exercise.IsPublished = true;
        }

        workout.PublishedExercises = workout.DraftExercises;
        workout.DraftExercises = null;

        await plannedWorkoutRepository.Update(workout, cancellationToken);

        var exerciseIds = workout.PublishedExercises
            .Select(x => x.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var exercises = await exerciseRepository.GetMany(exerciseIds, cancellationToken);

        return PlannedWorkoutResponse.From(workout, exercises);
    }
}
