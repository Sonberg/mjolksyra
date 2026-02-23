using MediatR;

namespace Mjolksyra.UseCases.Blocks.GetBlocks;

public class GetBlocksRequest : IRequest<ICollection<BlockResponse>>
{
}
