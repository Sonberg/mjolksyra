using MassTransit;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.Infrastructure.Messaging;

public class MassTransitCoachInsightsRebuildPublisher(IPublishEndpoint publishEndpoint)
    : ICoachInsightsRebuildPublisher
{
    public Task Publish(CoachInsightsRebuildRequestedMessage message, CancellationToken cancellationToken)
    {
        return publishEndpoint.Publish(message, cancellationToken);
    }
}
