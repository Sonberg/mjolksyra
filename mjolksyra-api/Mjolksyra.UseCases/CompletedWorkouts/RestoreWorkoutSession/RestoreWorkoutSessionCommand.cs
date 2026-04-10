using MediatR;
using Mjolksyra.UseCases.CompletedWorkouts;

namespace Mjolksyra.UseCases.CompletedWorkouts.RestoreWorkoutSession;

public class RestoreWorkoutSessionCommand : IRequest<WorkoutResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid Id { get; set; }
}
