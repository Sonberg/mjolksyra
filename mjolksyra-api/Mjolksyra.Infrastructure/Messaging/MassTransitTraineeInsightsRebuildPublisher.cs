using MassTransit;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.Infrastructure.Messaging;

public class MassTransitTraineeInsightsRebuildPublisher(IPublishEndpoint publishEndpoint)
    : ITraineeInsightsRebuildPublisher
{
    public Task Publish(TraineeInsightsRebuildRequestedMessage message, CancellationToken cancellationToken)
    {
        return publishEndpoint.Publish(message, cancellationToken);
    }
}
