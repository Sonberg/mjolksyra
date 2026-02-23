using MediatR;

namespace Mjolksyra.UseCases.Blocks.DeleteBlock;

public class DeleteBlockCommand : IRequest
{
    public Guid BlockId { get; set; }
}
