using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Infrastructure.Database;

public class AiCreditPackSeeder(IServiceProvider serviceProvider) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IAiCreditPackRepository>();

        await repo.Upsert(new AiCreditPack
        {
            Id = new Guid("20000000-0000-0000-0000-000000000001"),
            Name = "Small",
            Credits = 25,
            PriceSek = 39,
            IsActive = true,
        }, cancellationToken);

        await repo.Upsert(new AiCreditPack
        {
            Id = new Guid("20000000-0000-0000-0000-000000000002"),
            Name = "Medium",
            Credits = 100,
            PriceSek = 119,
            IsActive = true,
        }, cancellationToken);

        await repo.Upsert(new AiCreditPack
        {
            Id = new Guid("20000000-0000-0000-0000-000000000003"),
            Name = "Large",
            Credits = 300,
            PriceSek = 299,
            IsActive = true,
        }, cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
