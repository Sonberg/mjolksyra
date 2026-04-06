using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.DeleteAIPlannerSession;

public class DeleteAIPlannerSessionCommand : IRequest<bool>
{
    public required Guid TraineeId { get; set; }

    public required Guid SessionId { get; set; }
}
