using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class ProcessedStripeEventRepository(IMongoDbContext context) : IProcessedStripeEventRepository
{
    public async Task<bool> TryMarkAsProcessed(string eventId, string eventType, CancellationToken ct)
    {
        var document = new ProcessedStripeEvent
        {
            EventId = eventId,
            EventType = eventType,
            ProcessedAt = DateTimeOffset.UtcNow
        };

        try
        {
            await context.ProcessedStripeEvents.InsertOneAsync(document, new InsertOneOptions(), ct);
            return true;
        }
        catch (MongoWriteException ex) when (ex.WriteError.Category == ServerErrorCategory.DuplicateKey)
        {
            return false;
        }
    }
}
