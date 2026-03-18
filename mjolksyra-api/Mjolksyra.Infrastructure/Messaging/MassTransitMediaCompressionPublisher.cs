using MassTransit;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.Infrastructure.Messaging;

public class MassTransitMediaCompressionPublisher(IPublishEndpoint publishEndpoint)
    : IMediaCompressionPublisher
{
    public Task Publish(MediaCompressionRequestedMessage message, CancellationToken cancellationToken)
    {
        return publishEndpoint.Publish(message, cancellationToken);
    }
}
