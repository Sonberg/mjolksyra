using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Notifications;

namespace Mjolksyra.Infrastructure.Notifications;

public class NotificationService(
    INotificationRepository notificationRepository,
    INotificationRealtimePublisher notificationRealtimePublisher) : INotificationService
{
    public async Task Notify(
        Guid userId,
        string type,
        string title,
        string? body = null,
        string? href = null,
        CancellationToken cancellationToken = default)
    {
        await notificationRepository.Create(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            Title = title,
            Body = body,
            Href = href,
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        await notificationRealtimePublisher.PublishChanged(userId, cancellationToken);
    }

    public async Task NotifyMany(
        IEnumerable<Guid> userIds,
        string type,
        string title,
        string? body = null,
        string? href = null,
        CancellationToken cancellationToken = default)
    {
        foreach (var userId in userIds.Distinct())
        {
            await Notify(userId, type, title, body, href, cancellationToken);
        }
    }
}
