using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class CreditActionPricingRepository(IMongoDbContext context) : ICreditActionPricingRepository
{
    public async Task<CreditActionPricing?> GetByAction(CreditAction action, CancellationToken ct)
    {
        return await context.CreditActionPricings
            .Find(x => x.Action == action)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task Upsert(CreditActionPricing pricing, CancellationToken ct)
    {
        await context.CreditActionPricings.ReplaceOneAsync(
            x => x.Id == pricing.Id,
            pricing,
            new ReplaceOptions { IsUpsert = true },
            ct);
    }
}
