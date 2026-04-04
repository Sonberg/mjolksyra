using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Infrastructure.Database;

public class CreditPackSeeder(IServiceProvider serviceProvider) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ICreditPackRepository>();

        await repo.Upsert(new CreditPack
        {
            Id = new Guid("20000000-0000-0000-0000-000000000001"),
            Name = "Small",
            Credits = 50,
            PriceSek = 99,
            IsActive = true,
        }, cancellationToken);

        await repo.Upsert(new CreditPack
        {
            Id = new Guid("20000000-0000-0000-0000-000000000002"),
            Name = "Medium",
            Credits = 150,
            PriceSek = 249,
            IsActive = true,
        }, cancellationToken);

        await repo.Upsert(new CreditPack
        {
            Id = new Guid("20000000-0000-0000-0000-000000000003"),
            Name = "Large",
            Credits = 400,
            PriceSek = 599,
            IsActive = true,
        }, cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
