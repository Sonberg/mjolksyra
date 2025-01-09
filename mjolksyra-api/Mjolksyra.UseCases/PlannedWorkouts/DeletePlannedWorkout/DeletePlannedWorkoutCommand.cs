using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.DeletePlannedWorkout;

public class DeletePlannedWorkoutCommand : IRequest
{
    public Guid TraineeId { get; set; }
    
    public Guid PlannedWorkoutId { get; set; }
}