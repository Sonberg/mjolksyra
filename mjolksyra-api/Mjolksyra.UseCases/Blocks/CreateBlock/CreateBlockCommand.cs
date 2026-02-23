using MediatR;

namespace Mjolksyra.UseCases.Blocks.CreateBlock;

public class CreateBlockCommand : IRequest<BlockResponse>
{
    public required BlockRequest Block { get; set; }
}
