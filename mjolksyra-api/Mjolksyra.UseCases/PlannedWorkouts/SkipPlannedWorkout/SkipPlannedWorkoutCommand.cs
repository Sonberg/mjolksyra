using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.SkipPlannedWorkout;

public class SkipPlannedWorkoutCommand : IRequest<PlannedWorkoutResponse?>
{
    public required Guid TraineeId { get; set; }
    public required Guid PlannedWorkoutId { get; set; }
}
