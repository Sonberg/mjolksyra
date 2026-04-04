namespace Mjolksyra.Domain.Database.Models;

public class ProcessedStripeEvent
{
    public Guid Id { get; set; }

    public required string EventId { get; set; }

    public required string EventType { get; set; }

    public DateTimeOffset ProcessedAt { get; set; }
}
