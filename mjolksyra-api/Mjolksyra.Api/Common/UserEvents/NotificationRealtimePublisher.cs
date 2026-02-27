using Mjolksyra.Domain.Notifications;

namespace Mjolksyra.Api.Common.UserEvents;

public class NotificationRealtimePublisher(IUserEventPublisher userEventPublisher) : INotificationRealtimePublisher
{
    public async Task PublishChanged(Guid userId, CancellationToken cancellationToken = default)
    {
        var payload = new { source = "notifications" };

        await userEventPublisher.Publish(userId, "notifications.updated", payload, cancellationToken);
        await userEventPublisher.Publish(userId, "user.updated", payload, cancellationToken);
    }
}
