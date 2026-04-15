using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.UnskipPlannedWorkout;

public class UnskipPlannedWorkoutCommand : IRequest<PlannedWorkoutResponse?>
{
    public required Guid TraineeId { get; set; }
    public required Guid PlannedWorkoutId { get; set; }
}
