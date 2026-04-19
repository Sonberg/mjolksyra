using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Blocks.Planner.DeleteBlockPlannerSession;

public class DeleteBlockPlannerSessionCommandHandler(
    IBlockPlannerSessionRepository sessionRepository,
    IBlockRepository blockRepository,
    IUserContext userContext) : IRequestHandler<DeleteBlockPlannerSessionCommand, bool>
{
    public async Task<bool> Handle(DeleteBlockPlannerSessionCommand request, CancellationToken cancellationToken)
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

        var session = await sessionRepository.GetById(request.SessionId, cancellationToken);
        if (session is null || session.BlockId != request.BlockId || session.CoachUserId != userId)
        {
            return false;
        }

        await sessionRepository.Delete(request.SessionId, cancellationToken);
        return true;
    }
}
