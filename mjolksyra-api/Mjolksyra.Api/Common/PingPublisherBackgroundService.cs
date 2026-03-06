using MassTransit;
using Microsoft.Extensions.Options;
using Mjolksyra.Api.Options;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.Api.Common;

public class PingPublisherBackgroundService(
    IBus bus,
    IOptions<PingPongOptions> options,
    ILogger<PingPublisherBackgroundService> logger) : BackgroundService
{
    private readonly TimeSpan _interval = TimeSpan.FromSeconds(Math.Max(1, options.Value.IntervalSeconds));

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(_interval);

        while (!stoppingToken.IsCancellationRequested)
        {
            var message = new PingMessage
            {
                CorrelationId = Guid.NewGuid(),
                SentAt = DateTimeOffset.UtcNow
            };

            await bus.Publish(message, stoppingToken);
            logger.LogInformation("Ping published {CorrelationId}", message.CorrelationId);

            try
            {
                if (!await timer.WaitForNextTickAsync(stoppingToken))
                {
                    break;
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }
}
