using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.PublishDraftExercises;

public class PublishDraftExercisesCommand : IRequest<PlannedWorkoutResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid PlannedWorkoutId { get; set; }

    public ICollection<PlannedExerciseRequest>? Exercises { get; set; }
}
