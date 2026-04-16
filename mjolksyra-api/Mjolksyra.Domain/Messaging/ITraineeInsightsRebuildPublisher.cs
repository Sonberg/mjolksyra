namespace Mjolksyra.Domain.Messaging;

public interface ITraineeInsightsRebuildPublisher
{
    Task Publish(TraineeInsightsRebuildRequestedMessage message, CancellationToken cancellationToken);
}
