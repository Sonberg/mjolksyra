using MediatR;

namespace Mjolksyra.UseCases.Blocks.GetBlock;

public class GetBlockRequest : IRequest<BlockResponse?>
{
    public Guid BlockId { get; set; }
}
