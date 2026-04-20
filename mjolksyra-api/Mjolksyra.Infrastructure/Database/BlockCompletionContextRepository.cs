using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class BlockCompletionContextRepository(IMongoDbContext context) : IBlockCompletionContextRepository
{
    public async Task<BlockCompletionContext?> GetLatestByTraineeId(Guid traineeId, CancellationToken ct)
    {
        return await context.BlockCompletionContexts
            .Find(x => x.TraineeId == traineeId)
            .SortByDescending(x => x.CompletedAt)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task<BlockCompletionContext?> GetByBlockId(Guid blockId, Guid traineeId, CancellationToken ct)
    {
        return await context.BlockCompletionContexts
            .Find(x => x.BlockId == blockId && x.TraineeId == traineeId)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task<BlockCompletionContext> Create(BlockCompletionContext record, CancellationToken ct)
    {
        await context.BlockCompletionContexts.InsertOneAsync(record, new InsertOneOptions(), ct);
        return record;
    }
}
