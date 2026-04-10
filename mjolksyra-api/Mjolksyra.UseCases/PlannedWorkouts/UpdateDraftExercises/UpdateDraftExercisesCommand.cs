using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.UpdateDraftExercises;

public class UpdateDraftExercisesCommand : IRequest<PlannedWorkoutResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid PlannedWorkoutId { get; set; }

    public required ICollection<PlannedExerciseRequest> Exercises { get; set; }
}
