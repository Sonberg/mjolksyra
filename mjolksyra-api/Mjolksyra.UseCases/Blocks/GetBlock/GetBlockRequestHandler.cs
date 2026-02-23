using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Blocks.GetBlock;

public class GetBlockRequestHandler : IRequestHandler<GetBlockRequest, BlockResponse?>
{
    private readonly IBlockRepository _blockRepository;
    private readonly IUserContext _userContext;

    public GetBlockRequestHandler(IBlockRepository blockRepository, IUserContext userContext)
    {
        _blockRepository = blockRepository;
        _userContext = userContext;
    }

    public async Task<BlockResponse?> Handle(GetBlockRequest request, CancellationToken cancellationToken)
    {
        if (_userContext.UserId is not { } userId)
        {
            return null;
        }

        var block = await _blockRepository.Get(request.BlockId, cancellationToken);

        if (block is null || block.CoachId != userId)
        {
            return null;
        }

        return BlockResponse.From(block);
    }
}
