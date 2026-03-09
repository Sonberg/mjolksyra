using MassTransit;
using Microsoft.Extensions.Options;
using Mjolksyra.Api.Options;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.Api.Common;

public class PingPublisherBackgroundService(
    IBus bus,
    IServiceScopeFactory factory,
    IOptions<PingPongOptions> options,
    ILogger<PingPublisherBackgroundService> logger) : BackgroundService
{
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(_interval);

        while (!stoppingToken.IsCancellationRequested)
        {
            var scope = factory.CreateScope();
            var sender = scope.ServiceProvider.GetRequiredService<IEmailSender>();
            var message = new PingMessage
            {
                CorrelationId = Guid.NewGuid(),
                SentAt = DateTimeOffset.UtcNow
            };

            await sender.SendChargeNowToAthlete("per.sonberg@gmail.com", new AthleteBillingEmail
                {
                    Athlete = new User
                    {
                        GivenName = "Per",
                        Email = new Email
                        {
                            Normalized = "per.sonberg@gmail.com",
                            Value = "per.sonberg@gmail.com"
                        }
                    },
                    Coach = new User
                    {
                        GivenName = "Nathalie",
                        Email = new Email
                        {
                            Normalized = "per@glufs.co",
                            Value = "per@glufs.co"
                        }
                    },
                    PriceSek = 100,
                    NextChargeDate = "2024-07-01",
                },
                stoppingToken);
            await bus.Publish(message,
                stoppingToken);
            logger.LogInformation("Ping published {CorrelationId}",
                message.CorrelationId);
            try
            {
                if (!await timer.WaitForNextTickAsync(stoppingToken))
                {
                    break;
                }
            }
            catch (OperationCanceledException)when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }
}