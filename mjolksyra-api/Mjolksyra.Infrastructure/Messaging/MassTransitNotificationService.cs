using MassTransit;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.Notifications;

namespace Mjolksyra.Infrastructure.Messaging;

public class MassTransitNotificationService(IPublishEndpoint publishEndpoint) : INotificationService
{
    public Task Notify(NotificationRequest notification, CancellationToken cancellationToken = default)
    {
        return publishEndpoint.Publish(new NotificationSideEffectMessage
        {
            UserId = notification.UserId,
            Type = notification.Type,
            Title = notification.Title,
            Body = notification.Body,
            Href = notification.Href,
            CompletedWorkoutId = notification.CompletedWorkoutId,
        }, cancellationToken);
    }

    public Task NotifyMany(IEnumerable<Guid> userIds, NotificationRequest notification, CancellationToken cancellationToken = default)
    {
        return publishEndpoint.Publish(new NotificationSideEffectManyMessage
        {
            UserIds = userIds.Distinct().ToArray(),
            Type = notification.Type,
            Title = notification.Title,
            Body = notification.Body,
            Href = notification.Href,
            CompletedWorkoutId = notification.CompletedWorkoutId,
        }, cancellationToken);
    }
}
