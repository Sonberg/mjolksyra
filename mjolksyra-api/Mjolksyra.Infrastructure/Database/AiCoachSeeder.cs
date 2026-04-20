using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Mjolksyra.Domain.Constants;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Infrastructure.Database;

public class AiCoachSeeder(IServiceProvider serviceProvider) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var userRepo = scope.ServiceProvider.GetRequiredService<IUserRepository>();

        var existing = await userRepo.GetByEmail("ai-coach@mjolksyra.ai", cancellationToken);
        if (existing is not null) return;

        await userRepo.Create(new User
        {
            Id = AiCoachConstants.UserId,
            GivenName = "Adaptive",
            FamilyName = "AI Coach",
            Email = Email.From("ai-coach@mjolksyra.ai"),
            IsAiCoach = true,
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
