namespace Mjolksyra.Domain.Database;

public interface IProcessedStripeEventRepository
{
    Task<bool> TryMarkAsProcessed(string eventId, string eventType, CancellationToken ct);
}
