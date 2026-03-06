namespace Mjolksyra.Domain.Messaging;

public class PingMessage
{
    public required Guid CorrelationId { get; set; }

    public required DateTimeOffset SentAt { get; set; }
}
