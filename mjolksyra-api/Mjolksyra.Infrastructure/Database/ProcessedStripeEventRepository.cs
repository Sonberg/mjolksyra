using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class ProcessedStripeEventRepository(IMongoDbContext context) : IProcessedStripeEventRepository
{
    public async Task<bool> TryMarkAsProcessed(string eventId, string eventType, CancellationToken ct)
    {
        var existing = await context.ProcessedStripeEvents
            .Find(x => x.EventId == eventId)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);

        if (existing is not null)
        {
            return false;
        }

        await context.ProcessedStripeEvents.InsertOneAsync(new ProcessedStripeEvent
        {
            Id = Guid.NewGuid(),
            EventId = eventId,
            EventType = eventType,
            ProcessedAt = DateTimeOffset.UtcNow,
        }, new InsertOneOptions(), ct);

        return true;
    }
}
