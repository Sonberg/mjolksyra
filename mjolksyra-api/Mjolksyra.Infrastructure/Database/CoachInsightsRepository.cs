using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class CoachInsightsRepository(IMongoDbContext context) : ICoachInsightsRepository
{
    public async Task<CoachInsights?> GetByCoachUserId(Guid coachUserId, CancellationToken ct)
    {
        return await context.CoachInsights
            .Find(x => x.Id == coachUserId)
            .FirstOrDefaultAsync(ct);
    }

    public async Task Upsert(CoachInsights insights, CancellationToken ct)
    {
        await context.CoachInsights.ReplaceOneAsync(
            x => x.Id == insights.Id,
            insights,
            new ReplaceOptions { IsUpsert = true },
            ct);
    }
}
