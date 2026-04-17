using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Notifications;

namespace Mjolksyra.Infrastructure.Notifications;

public class NotificationService(
    INotificationRepository notificationRepository,
    INotificationRealtimePublisher notificationRealtimePublisher) : INotificationService
{
    public async Task Notify(NotificationRequest notification, CancellationToken cancellationToken = default)
    {
        await notificationRepository.Create(new Notification
        {
            Id = Guid.NewGuid(),
            UserId = notification.UserId,
            Type = notification.Type,
            Title = notification.Title,
            Body = notification.Body,
            Href = notification.Href,
            CompletedWorkoutId = notification.CompletedWorkoutId,
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        await notificationRealtimePublisher.PublishChanged(notification.UserId, cancellationToken);
    }

    public async Task NotifyMany(IEnumerable<Guid> userIds, NotificationRequest notification, CancellationToken cancellationToken = default)
    {
        foreach (var userId in userIds.Distinct())
        {
            await Notify(notification with { UserId = userId }, cancellationToken);
        }
    }
}
