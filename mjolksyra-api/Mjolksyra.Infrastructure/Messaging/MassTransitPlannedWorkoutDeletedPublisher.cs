using MassTransit;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.Infrastructure.Messaging;

public class MassTransitPlannedWorkoutDeletedPublisher(IPublishEndpoint publishEndpoint)
    : IPlannedWorkoutDeletedPublisher
{
    public Task Publish(PlannedWorkoutDeletedMessage message, CancellationToken cancellationToken)
    {
        return publishEndpoint.Publish(message, cancellationToken);
    }
}
