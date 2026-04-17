using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Blocks.Planner.DiscardBlockPlannerProposal;

public class DiscardBlockPlannerProposalCommandHandler(
    IBlockPlannerSessionRepository sessionRepository,
    IBlockRepository blockRepository,
    IUserContext userContext) : IRequestHandler<DiscardBlockPlannerProposalCommand, bool>
{
    public async Task<bool> Handle(DiscardBlockPlannerProposalCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return false;
        }

        var block = await blockRepository.Get(request.BlockId, cancellationToken);
        if (block is null || block.CoachId != userId)
        {
            return false;
        }

        var session = await sessionRepository.GetByProposalId(request.ProposalId, userId, cancellationToken);
        if (session is null || session.BlockId != request.BlockId || session.ProposedActionSet is null)
        {
            return false;
        }

        session.ProposedActionSet.Status = AIPlannerProposalStatus.Discarded;
        session.UpdatedAt = DateTimeOffset.UtcNow;
        await sessionRepository.Update(session, cancellationToken);
        return true;
    }
}
