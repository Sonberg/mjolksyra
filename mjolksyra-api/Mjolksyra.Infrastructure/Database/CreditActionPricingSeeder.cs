using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Infrastructure.Database;

public class CreditActionPricingSeeder(IServiceProvider serviceProvider) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ICreditActionPricingRepository>();

        await repo.Upsert(new CreditActionPricing
        {
            Id = new Guid("10000000-0000-0000-0000-000000000004"),
            Action = CreditAction.AnalyzeCompletedWorkout,
            CreditCost = 5,
        }, cancellationToken);

        await repo.Upsert(new CreditActionPricing
        {
            Id = new Guid("10000000-0000-0000-0000-000000000005"),
            Action = CreditAction.GenerateWorkoutPlan,
            CreditCost = 5,
        }, cancellationToken);

        await repo.Upsert(new CreditActionPricing
        {
            Id = new Guid("10000000-0000-0000-0000-000000000006"),
            Action = CreditAction.RebuildTraineeInsights,
            CreditCost = 1,
        }, cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
