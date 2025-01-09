using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkout;

public class UpdatePlannedWorkoutCommand : IRequest<PlannedWorkoutResponse>
{
    public required Guid TraineeId { get; set; }

    public required Guid PlannedWorkoutId { get; set; }

    public required PlannedWorkoutRequest Workout { get; set; }
}