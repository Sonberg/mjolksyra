namespace Mjolksyra.Domain.Database.Models;

public class ProcessedStripeEvent
{
    public string EventId { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public DateTimeOffset ProcessedAt { get; set; }
}
