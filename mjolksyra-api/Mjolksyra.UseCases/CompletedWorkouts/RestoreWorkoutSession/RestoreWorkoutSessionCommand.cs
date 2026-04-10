using MediatR;
using Mjolksyra.UseCases.CompletedWorkouts;

namespace Mjolksyra.UseCases.CompletedWorkouts.RestoreWorkoutSession;

public class RestoreWorkoutSessionCommand : IRequest<CompletedWorkoutResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid PlannedWorkoutId { get; set; }
}
