using MediatR;
using Mjolksyra.UseCases.CompletedWorkouts;

namespace Mjolksyra.UseCases.CompletedWorkouts.StartWorkoutSession;

public class StartWorkoutSessionCommand : IRequest<CompletedWorkoutResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid PlannedWorkoutId { get; set; }
}

public class StartWorkoutSessionRequest
{
    public required Guid PlannedWorkoutId { get; set; }
}
