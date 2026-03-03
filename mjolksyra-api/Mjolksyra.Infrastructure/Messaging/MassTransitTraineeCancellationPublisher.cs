using MassTransit;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.Infrastructure.Messaging;

public class MassTransitTraineeCancellationPublisher(IPublishEndpoint publishEndpoint)
    : ITraineeCancellationPublisher
{
    public Task Publish(TraineeCancellationMessage message, CancellationToken cancellationToken)
    {
        return publishEndpoint.Publish(message, cancellationToken);
    }
}
