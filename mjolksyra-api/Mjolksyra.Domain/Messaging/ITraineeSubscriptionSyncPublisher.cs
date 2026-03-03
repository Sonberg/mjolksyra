namespace Mjolksyra.Domain.Messaging;

public interface ITraineeSubscriptionSyncPublisher
{
    Task Publish(TraineeSubscriptionSyncMessage message, CancellationToken cancellationToken);
}
