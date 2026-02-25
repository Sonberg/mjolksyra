namespace Mjolksyra.Domain.Notifications;

public interface INotificationService
{
    Task Notify(Guid userId, string type, string title, string? body = null, string? href = null, CancellationToken cancellationToken = default);

    Task NotifyMany(IEnumerable<Guid> userIds, string type, string title, string? body = null, string? href = null, CancellationToken cancellationToken = default);
}
