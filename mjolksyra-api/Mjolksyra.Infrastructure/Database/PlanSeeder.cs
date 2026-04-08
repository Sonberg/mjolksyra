using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Infrastructure.Database;

public class PlanSeeder(IServiceProvider serviceProvider) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var planRepository = scope.ServiceProvider.GetRequiredService<IPlanRepository>();

        await planRepository.Upsert(new Plan
        {
            Id = Plan.StarterPlanId,
            Name = "Starter",
            MonthlyPriceSek = 199,
            IncludedAthletes = 5,
            ExtraAthletePriceSek = 49,
            IncludedCreditsPerCycle = 100,
            SortOrder = 1,
        }, cancellationToken);

        await planRepository.Upsert(new Plan
        {
            Id = Plan.ProPlanId,
            Name = "Pro",
            MonthlyPriceSek = 399,
            IncludedAthletes = 12,
            ExtraAthletePriceSek = 39,
            IncludedCreditsPerCycle = 400,
            SortOrder = 2,
        }, cancellationToken);

        await planRepository.Upsert(new Plan
        {
            Id = Plan.ScalePlanId,
            Name = "Scale",
            MonthlyPriceSek = 699,
            IncludedAthletes = 25,
            ExtraAthletePriceSek = 29,
            IncludedCreditsPerCycle = 1000,
            SortOrder = 3,
        }, cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
