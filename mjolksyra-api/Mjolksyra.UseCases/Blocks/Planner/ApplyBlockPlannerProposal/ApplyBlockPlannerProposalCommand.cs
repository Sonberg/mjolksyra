using MediatR;
using OneOf;

namespace Mjolksyra.UseCases.Blocks.Planner.ApplyBlockPlannerProposal;

public class ApplyBlockPlannerProposalCommand : IRequest<OneOf<ApplyBlockPlannerProposalResponse, ApplyBlockPlannerProposalForbidden, ApplyBlockPlannerProposalInsufficientCredits>>
{
    public required Guid BlockId { get; set; }

    public required Guid ProposalId { get; set; }
}

public class ApplyBlockPlannerProposalResponse
{
    public required Guid SessionId { get; set; }

    public required Guid ProposalId { get; set; }

    public required int ActionsApplied { get; set; }

    public required string Summary { get; set; }
}

public class ApplyBlockPlannerProposalForbidden;

public class ApplyBlockPlannerProposalInsufficientCredits(string reason)
{
    public string Reason { get; } = reason;
}
