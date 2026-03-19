using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class CreditPackRepository(IMongoDbContext context) : ICreditPackRepository
{
    public async Task<ICollection<CreditPack>> GetAll(CancellationToken ct)
    {
        return await context.CreditPacks
            .Find(x => x.IsActive)
            .ToListAsync(ct)
            .ContinueWith(t => (ICollection<CreditPack>)t.Result, ct);
    }

    public async Task<CreditPack?> GetById(Guid id, CancellationToken ct)
    {
        return await context.CreditPacks
            .Find(x => x.Id == id)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task Upsert(CreditPack pack, CancellationToken ct)
    {
        await context.CreditPacks.ReplaceOneAsync(
            x => x.Id == pack.Id,
            pack,
            new ReplaceOptions { IsUpsert = true },
            ct);
    }
}
