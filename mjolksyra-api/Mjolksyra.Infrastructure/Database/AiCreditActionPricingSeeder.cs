using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Infrastructure.Database;

public class AiCreditActionPricingSeeder(IServiceProvider serviceProvider) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = serviceProvider.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IAiCreditActionPricingRepository>();

        await repo.Upsert(new AiCreditActionPricing
        {
            Id = new Guid("10000000-0000-0000-0000-000000000001"),
            Action = AiCreditAction.PlanWorkout,
            CreditCost = 1,
        }, cancellationToken);

        await repo.Upsert(new AiCreditActionPricing
        {
            Id = new Guid("10000000-0000-0000-0000-000000000002"),
            Action = AiCreditAction.GenerateBlock,
            CreditCost = 5,
        }, cancellationToken);

        await repo.Upsert(new AiCreditActionPricing
        {
            Id = new Guid("10000000-0000-0000-0000-000000000003"),
            Action = AiCreditAction.AnalyzeWorkoutText,
            CreditCost = 1,
        }, cancellationToken);

        await repo.Upsert(new AiCreditActionPricing
        {
            Id = new Guid("10000000-0000-0000-0000-000000000004"),
            Action = AiCreditAction.AnalyzeWorkoutMedia,
            CreditCost = 5,
        }, cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
