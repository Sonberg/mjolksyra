using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class AiCreditActionPricingRepository(IMongoDbContext context) : IAiCreditActionPricingRepository
{
    public async Task<AiCreditActionPricing?> GetByAction(AiCreditAction action, CancellationToken ct)
    {
        return await context.AiCreditActionPricings
            .Find(x => x.Action == action)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task Upsert(AiCreditActionPricing pricing, CancellationToken ct)
    {
        await context.AiCreditActionPricings.ReplaceOneAsync(
            x => x.Id == pricing.Id,
            pricing,
            new ReplaceOptions { IsUpsert = true },
            ct);
    }
}
