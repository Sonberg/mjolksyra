using MediatR;

namespace Mjolksyra.UseCases.Blocks.Planner.DiscardBlockPlannerProposal;

public class DiscardBlockPlannerProposalCommand : IRequest<bool>
{
    public required Guid BlockId { get; set; }

    public required Guid ProposalId { get; set; }
}
