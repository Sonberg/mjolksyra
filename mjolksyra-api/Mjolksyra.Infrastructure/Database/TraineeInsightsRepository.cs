using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class TraineeInsightsRepository(IMongoDbContext context) : ITraineeInsightsRepository
{
    public async Task<TraineeInsights?> GetByTraineeId(Guid traineeId, CancellationToken ct)
    {
        return await context.TraineeInsights
            .Find(x => x.Id == traineeId)
            .FirstOrDefaultAsync(ct);
    }

    public async Task Upsert(TraineeInsights insights, CancellationToken ct)
    {
        await context.TraineeInsights.ReplaceOneAsync(
            x => x.Id == insights.Id,
            insights,
            new ReplaceOptions { IsUpsert = true },
            ct);
    }
}
