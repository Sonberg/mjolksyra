using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkout;

public class GetPlannedWorkoutRequest : IRequest<PlannedWorkoutResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid PlannedWorkoutId { get; set; }
}
