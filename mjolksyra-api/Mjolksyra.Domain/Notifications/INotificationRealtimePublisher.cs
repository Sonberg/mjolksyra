namespace Mjolksyra.Domain.Notifications;

public interface INotificationRealtimePublisher
{
    Task PublishChanged(Guid userId, CancellationToken cancellationToken = default);
}
