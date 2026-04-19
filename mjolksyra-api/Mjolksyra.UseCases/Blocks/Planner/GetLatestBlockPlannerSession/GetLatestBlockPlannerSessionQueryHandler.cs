using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Blocks.Planner.GetLatestBlockPlannerSession;

public class GetLatestBlockPlannerSessionQueryHandler(
    IBlockPlannerSessionRepository sessionRepository,
    IBlockRepository blockRepository,
    IUserContext userContext) : IRequestHandler<GetLatestBlockPlannerSessionQuery, GetLatestBlockPlannerSessionResponse?>
{
    public async Task<GetLatestBlockPlannerSessionResponse?> Handle(
        GetLatestBlockPlannerSessionQuery request,
        CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        var block = await blockRepository.Get(request.BlockId, cancellationToken);
        if (block is null || block.CoachId != userId)
        {
            return null;
        }

        var session = await sessionRepository.GetLatestByBlock(request.BlockId, userId, cancellationToken);
        if (session is null)
        {
            return null;
        }

        return new GetLatestBlockPlannerSessionResponse
        {
            SessionId = session.Id,
            Description = session.Description,
            ConversationHistory = session.ConversationHistory
                .Select(m => new BlockPlannerSessionMessageDto
                {
                    Role = m.Role,
                    Content = m.Content,
                    Options = m.Options,
                })
                .ToList(),
            ProposedActionSet = session.ProposedActionSet,
        };
    }
}
