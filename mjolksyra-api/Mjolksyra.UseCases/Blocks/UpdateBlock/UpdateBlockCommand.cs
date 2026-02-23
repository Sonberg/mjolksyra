using MediatR;

namespace Mjolksyra.UseCases.Blocks.UpdateBlock;

public class UpdateBlockCommand : IRequest<BlockResponse?>
{
    public Guid BlockId { get; set; }

    public required BlockRequest Block { get; set; }
}
