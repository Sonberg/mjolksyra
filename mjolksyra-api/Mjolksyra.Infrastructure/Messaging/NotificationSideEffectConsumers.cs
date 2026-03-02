using MassTransit;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.Notifications;

namespace Mjolksyra.Infrastructure.Messaging;

public class NotificationSideEffectConsumer(NotificationService notificationService)
    : IConsumer<NotificationSideEffectMessage>
{
    public async Task Consume(ConsumeContext<NotificationSideEffectMessage> context)
    {
        var message = context.Message;
        await notificationService.Notify(
            message.UserId,
            message.Type,
            message.Title,
            message.Body,
            message.Href,
            context.CancellationToken);
    }
}

public class NotificationSideEffectManyConsumer(NotificationService notificationService)
    : IConsumer<NotificationSideEffectManyMessage>
{
    public async Task Consume(ConsumeContext<NotificationSideEffectManyMessage> context)
    {
        var message = context.Message;
        await notificationService.NotifyMany(
            message.UserIds,
            message.Type,
            message.Title,
            message.Body,
            message.Href,
            context.CancellationToken);
    }
}
