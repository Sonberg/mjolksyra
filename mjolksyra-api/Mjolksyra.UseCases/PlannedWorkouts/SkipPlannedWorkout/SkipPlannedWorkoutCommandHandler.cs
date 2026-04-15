using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.PlannedWorkouts.SkipPlannedWorkout;

public class SkipPlannedWorkoutCommandHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IExerciseRepository exerciseRepository) : IRequestHandler<SkipPlannedWorkoutCommand, PlannedWorkoutResponse?>
{
    public async Task<PlannedWorkoutResponse?> Handle(SkipPlannedWorkoutCommand request, CancellationToken cancellationToken)
    {
        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);

        if (workout is null || workout.TraineeId != request.TraineeId)
            return null;

        workout.SkippedAt = DateTimeOffset.UtcNow;

        await plannedWorkoutRepository.Update(workout, cancellationToken);

        var exerciseIds = workout.PublishedExercises
            .Concat(workout.DraftExercises ?? [])
            .Select(x => x.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var exercises = await exerciseRepository.GetMany(exerciseIds, cancellationToken);

        return PlannedWorkoutResponse.From(workout, exercises);
    }
}
