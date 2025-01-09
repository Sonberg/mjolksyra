using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.CreatePlannedWorkout;

public class CreatePlannedWorkoutCommand :  IRequest<PlannedWorkoutResponse>
{
    public Guid TraineeId { get; set; }
    
    public required PlannedWorkoutRequest Workout { get; set; }
}