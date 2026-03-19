using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class AiCreditPackRepository(IMongoDbContext context) : IAiCreditPackRepository
{
    public async Task<ICollection<AiCreditPack>> GetAll(CancellationToken ct)
    {
        return await context.AiCreditPacks
            .Find(x => x.IsActive)
            .ToListAsync(ct)
            .ContinueWith(t => (ICollection<AiCreditPack>)t.Result, ct);
    }

    public async Task<AiCreditPack?> GetById(Guid id, CancellationToken ct)
    {
        return await context.AiCreditPacks
            .Find(x => x.Id == id)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task Upsert(AiCreditPack pack, CancellationToken ct)
    {
        await context.AiCreditPacks.ReplaceOneAsync(
            x => x.Id == pack.Id,
            pack,
            new ReplaceOptions { IsUpsert = true },
            ct);
    }
}
