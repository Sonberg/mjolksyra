using MassTransit;
using Microsoft.Extensions.Logging;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.Infrastructure.Messaging.Consumers;

public class PingPongConsumer(ILogger<PingPongConsumer> logger) : IConsumer<PingMessage>
{
    public Task Consume(ConsumeContext<PingMessage> context)
    {
        logger.LogInformation(
            "Pong received for ping {CorrelationId} sent at {SentAt}",
            context.Message.CorrelationId,
            context.Message.SentAt);

        return Task.CompletedTask;
    }
}
