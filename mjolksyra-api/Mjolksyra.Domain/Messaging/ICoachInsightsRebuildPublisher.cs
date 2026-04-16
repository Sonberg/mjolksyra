namespace Mjolksyra.Domain.Messaging;

public interface ICoachInsightsRebuildPublisher
{
    Task Publish(CoachInsightsRebuildRequestedMessage message, CancellationToken cancellationToken);
}
