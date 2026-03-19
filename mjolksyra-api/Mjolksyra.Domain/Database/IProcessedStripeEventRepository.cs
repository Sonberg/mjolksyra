namespace Mjolksyra.Domain.Database;

public interface IProcessedStripeEventRepository
{
    /// <summary>
    /// Marks the event as processed atomically.
    /// Returns true if the event was NOT previously processed (and is now marked).
    /// Returns false if the event was already processed (duplicate — caller should skip).
    /// </summary>
    Task<bool> TryMarkAsProcessed(string eventId, string eventType, CancellationToken ct);
}
