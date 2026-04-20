using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IBlockCompletionContextRepository
{
    Task<BlockCompletionContext?> GetLatestByTraineeId(Guid traineeId, CancellationToken ct);

    Task<BlockCompletionContext?> GetByBlockId(Guid blockId, Guid traineeId, CancellationToken ct);

    Task<BlockCompletionContext> Create(BlockCompletionContext context, CancellationToken ct);
}
