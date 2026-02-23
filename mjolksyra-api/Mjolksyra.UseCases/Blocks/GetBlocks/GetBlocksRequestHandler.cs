using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Blocks.GetBlocks;

public class GetBlocksRequestHandler : IRequestHandler<GetBlocksRequest, ICollection<BlockResponse>>
{
    private readonly IBlockRepository _blockRepository;
    private readonly IUserContext _userContext;

    public GetBlocksRequestHandler(IBlockRepository blockRepository, IUserContext userContext)
    {
        _blockRepository = blockRepository;
        _userContext = userContext;
    }

    public async Task<ICollection<BlockResponse>> Handle(GetBlocksRequest request, CancellationToken cancellationToken)
    {
        if (await _userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return [];
        }

        var blocks = await _blockRepository.GetByCoach(userId, cancellationToken);

        return blocks.Select(BlockResponse.From).ToList();
    }
}
