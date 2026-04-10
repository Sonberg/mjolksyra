using MediatR;
using Mjolksyra.UseCases.CompletedWorkouts;

namespace Mjolksyra.UseCases.CompletedWorkouts.GetWorkoutSession;

public class GetWorkoutSessionRequest : IRequest<CompletedWorkoutResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid PlannedWorkoutId { get; set; }
}
