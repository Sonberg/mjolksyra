using MediatR;
using Mjolksyra.UseCases.CompletedWorkouts;

namespace Mjolksyra.UseCases.CompletedWorkouts.CreateCompletedWorkout;

public class CreateCompletedWorkoutCommand : IRequest<CompletedWorkoutResponse?>
{
    public required Guid TraineeId { get; set; }

    public required CreateCompletedWorkoutRequest Workout { get; set; }
}

public class CreateCompletedWorkoutRequest
{
    public required DateOnly PlannedAt { get; set; }
}
