namespace Mjolksyra.Domain.Messaging;

public interface ITraineeCancellationPublisher
{
    Task Publish(TraineeCancellationMessage message, CancellationToken cancellationToken);
}
