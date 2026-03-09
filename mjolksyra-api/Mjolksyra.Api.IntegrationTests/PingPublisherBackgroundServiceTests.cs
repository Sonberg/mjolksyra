using MassTransit;
using Microsoft.Extensions.Logging;
using Moq;
using Mjolksyra.Api.Common;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.Api.IntegrationTests;

public class PingPublisherBackgroundServiceTests
{
    [Fact]
    public async Task StartAsync_PublishesPingMessage()
    {
        var bus = new Mock<IBus>();

        bus
            .Setup(x => x.Publish(It.IsAny<PingMessage>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var sut = new PingPublisherBackgroundService(
            bus.Object,
            Mock.Of<ILogger<PingPublisherBackgroundService>>());

        await sut.StartAsync(CancellationToken.None);
        await Task.Delay(50);
        await sut.StopAsync(CancellationToken.None);

        bus.Verify(
            x => x.Publish(
                It.Is<PingMessage>(m => m.CorrelationId != Guid.Empty),
                It.IsAny<CancellationToken>()),
            Times.AtLeastOnce);
    }
}
