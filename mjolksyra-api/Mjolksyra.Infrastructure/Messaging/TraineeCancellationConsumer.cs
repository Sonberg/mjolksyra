using MassTransit;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.Stripe;

namespace Mjolksyra.Infrastructure.Messaging;

public class TraineeCancellationConsumer(IStripeSubscriptionService subscriptionService)
    : IConsumer<TraineeCancellationMessage>
{
    public Task Consume(ConsumeContext<TraineeCancellationMessage> context)
    {
        return subscriptionService.CancelAsync(context.Message.SubscriptionId, context.CancellationToken);
    }
}
