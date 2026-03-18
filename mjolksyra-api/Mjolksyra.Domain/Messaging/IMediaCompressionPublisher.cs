namespace Mjolksyra.Domain.Messaging;

public interface IMediaCompressionPublisher
{
    Task Publish(MediaCompressionRequestedMessage message, CancellationToken cancellationToken);
}
