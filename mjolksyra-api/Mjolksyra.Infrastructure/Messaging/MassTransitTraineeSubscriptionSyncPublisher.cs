using MassTransit;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.Infrastructure.Messaging;

public class MassTransitTraineeSubscriptionSyncPublisher(IPublishEndpoint publishEndpoint)
    : ITraineeSubscriptionSyncPublisher
{
    public Task Publish(TraineeSubscriptionSyncMessage message, CancellationToken cancellationToken)
    {
        return publishEndpoint.Publish(message, cancellationToken);
    }
}
