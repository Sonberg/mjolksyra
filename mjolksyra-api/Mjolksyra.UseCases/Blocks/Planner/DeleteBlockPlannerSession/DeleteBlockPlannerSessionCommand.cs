using MediatR;

namespace Mjolksyra.UseCases.Blocks.Planner.DeleteBlockPlannerSession;

public class DeleteBlockPlannerSessionCommand : IRequest<bool>
{
    public required Guid BlockId { get; set; }

    public required Guid SessionId { get; set; }
}
