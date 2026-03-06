using MassTransit;
using Microsoft.Extensions.Logging;
using Moq;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.Messaging;

namespace Mjolksyra.Infrastructure.Tests.Messaging;

public class PingPongConsumerTests
{
    [Fact]
    public async Task Consume_LogsPong()
    {
        var logger = new Mock<ILogger<PingPongConsumer>>();
        var consumer = new PingPongConsumer(logger.Object);
        var message = new PingMessage
        {
            CorrelationId = Guid.NewGuid(),
            SentAt = DateTimeOffset.UtcNow
        };

        var context = new Mock<ConsumeContext<PingMessage>>();
        context.SetupGet(x => x.Message).Returns(message);

        await consumer.Consume(context.Object);

        logger.Verify(
            x => x.Log(
                LogLevel.Information,
                It.IsAny<EventId>(),
                It.Is<It.IsAnyType>((state, _) => state.ToString()!.Contains("Pong received for ping")),
                It.IsAny<Exception>(),
                It.IsAny<Func<It.IsAnyType, Exception?, string>>()),
            Times.Once);
    }
}
