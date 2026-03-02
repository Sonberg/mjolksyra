using MassTransit;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.Notifications;

namespace Mjolksyra.Infrastructure.Messaging;

public class MassTransitNotificationService(IPublishEndpoint publishEndpoint) : INotificationService
{
    public Task Notify(
        Guid userId,
        string type,
        string title,
        string? body = null,
        string? href = null,
        CancellationToken cancellationToken = default)
    {
        return publishEndpoint.Publish(new NotificationSideEffectMessage
        {
            UserId = userId,
            Type = type,
            Title = title,
            Body = body,
            Href = href,
        }, cancellationToken);
    }

    public Task NotifyMany(
        IEnumerable<Guid> userIds,
        string type,
        string title,
        string? body = null,
        string? href = null,
        CancellationToken cancellationToken = default)
    {
        return publishEndpoint.Publish(new NotificationSideEffectManyMessage
        {
            UserIds = userIds.Distinct().ToArray(),
            Type = type,
            Title = title,
            Body = body,
            Href = href,
        }, cancellationToken);
    }
}
