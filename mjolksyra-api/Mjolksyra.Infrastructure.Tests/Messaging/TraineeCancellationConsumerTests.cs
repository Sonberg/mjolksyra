using MassTransit;
using Moq;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.Messaging;
using Mjolksyra.Infrastructure.Messaging.Consumers;
using Mjolksyra.Infrastructure.Stripe;
using Stripe;

namespace Mjolksyra.Infrastructure.Tests.Messaging;

public class TraineeCancellationConsumerTests
{
    private static Mock<ConsumeContext<TraineeCancellationMessage>> BuildContext(string subscriptionId)
    {
        var context = new Mock<ConsumeContext<TraineeCancellationMessage>>();
        context.SetupGet(x => x.Message).Returns(new TraineeCancellationMessage
        {
            SubscriptionId = subscriptionId
        });
        context.SetupGet(x => x.CancellationToken).Returns(CancellationToken.None);
        return context;
    }

    [Fact]
    public async Task Consume_CancelsStripeSubscription()
    {
        var subscriptionService = new Mock<IStripeSubscriptionService>();
        subscriptionService.Setup(x => x.CancelAsync("sub_abc", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Subscription { Id = "sub_abc" });

        var consumer = new TraineeCancellationConsumer(subscriptionService.Object);

        await consumer.Consume(BuildContext("sub_abc").Object);

        subscriptionService.Verify(x => x.CancelAsync("sub_abc", CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task Consume_PassesCorrectSubscriptionId()
    {
        var capturedId = string.Empty;
        var subscriptionService = new Mock<IStripeSubscriptionService>();
        subscriptionService.Setup(x => x.CancelAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Callback<string, CancellationToken>((id, _) => capturedId = id)
            .ReturnsAsync(new Subscription());

        var consumer = new TraineeCancellationConsumer(subscriptionService.Object);

        await consumer.Consume(BuildContext("sub_xyz").Object);

        Assert.Equal("sub_xyz", capturedId);
    }
}
