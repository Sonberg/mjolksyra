using MassTransit;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.Infrastructure.Notifications;

namespace Mjolksyra.Infrastructure.Messaging.Consumers;

public class NotificationSideEffectConsumer(NotificationService notificationService)
    : IConsumer<NotificationSideEffectMessage>
{
    public async Task Consume(ConsumeContext<NotificationSideEffectMessage> context)
    {
        var message = context.Message;
        await notificationService.Notify(new NotificationRequest
        {
            UserId = message.UserId,
            Type = message.Type,
            Title = message.Title,
            Body = message.Body,
            Href = message.Href,
            CompletedWorkoutId = message.CompletedWorkoutId,
        }, context.CancellationToken);
    }
}

public class NotificationSideEffectManyConsumer(NotificationService notificationService)
    : IConsumer<NotificationSideEffectManyMessage>
{
    public async Task Consume(ConsumeContext<NotificationSideEffectManyMessage> context)
    {
        var message = context.Message;
        await notificationService.NotifyMany(message.UserIds, new NotificationRequest
        {
            Type = message.Type,
            Title = message.Title,
            Body = message.Body,
            Href = message.Href,
            CompletedWorkoutId = message.CompletedWorkoutId,
        }, context.CancellationToken);
    }
}
