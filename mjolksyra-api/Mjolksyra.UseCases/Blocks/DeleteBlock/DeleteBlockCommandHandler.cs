using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Blocks.DeleteBlock;

public class DeleteBlockCommandHandler : IRequestHandler<DeleteBlockCommand>
{
    private readonly IBlockRepository _blockRepository;
    private readonly IUserContext _userContext;

    public DeleteBlockCommandHandler(IBlockRepository blockRepository, IUserContext userContext)
    {
        _blockRepository = blockRepository;
        _userContext = userContext;
    }

    public async Task Handle(DeleteBlockCommand request, CancellationToken cancellationToken)
    {
        if (_userContext.UserId is not { } userId)
        {
            return;
        }

        var existing = await _blockRepository.Get(request.BlockId, cancellationToken);

        if (existing is null || existing.CoachId != userId)
        {
            return;
        }

        await _blockRepository.Delete(request.BlockId, cancellationToken);
    }
}
