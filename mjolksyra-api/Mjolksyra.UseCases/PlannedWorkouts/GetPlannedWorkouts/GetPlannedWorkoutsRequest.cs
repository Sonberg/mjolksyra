using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkouts;

public class GetPlannedWorkoutsRequest : IRequest<ICollection<PlannedWorkoutResponse>>
{
    public Guid TraineeId { get; set; }

    public DateOnly From { get; set; }

    public DateOnly To { get; set; }
}