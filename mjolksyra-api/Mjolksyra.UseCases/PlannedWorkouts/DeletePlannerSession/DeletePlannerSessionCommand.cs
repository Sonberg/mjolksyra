using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.DeletePlannerSession;

public class DeletePlannerSessionCommand : IRequest<bool>
{
    public required Guid TraineeId { get; set; }

    public required Guid SessionId { get; set; }
}
