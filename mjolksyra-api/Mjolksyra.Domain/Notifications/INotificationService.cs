namespace Mjolksyra.Domain.Notifications;

public interface INotificationService
{
    Task Notify(NotificationRequest notification, CancellationToken cancellationToken = default);

    Task NotifyMany(IEnumerable<Guid> userIds, NotificationRequest notification, CancellationToken cancellationToken = default);
}
