using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class CoachAiCreditsRepository(IMongoDbContext context) : ICoachAiCreditsRepository
{
    public async Task<CoachAiCredits?> GetByCoachUserId(Guid coachUserId, CancellationToken ct)
    {
        return await context.CoachAiCredits
            .Find(x => x.CoachUserId == coachUserId)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task Create(CoachAiCredits credits, CancellationToken ct)
    {
        await context.CoachAiCredits.InsertOneAsync(credits, new InsertOneOptions(), ct);
    }

    public async Task<CoachAiCredits?> AtomicDeduct(
        Guid coachUserId,
        int includedToDeduct,
        int purchasedToDeduct,
        int expectedVersion,
        CancellationToken ct)
    {
        var filter = Builders<CoachAiCredits>.Filter.And(
            Builders<CoachAiCredits>.Filter.Eq(x => x.CoachUserId, coachUserId),
            Builders<CoachAiCredits>.Filter.Eq(x => x.Version, expectedVersion)
        );

        var update = Builders<CoachAiCredits>.Update
            .Inc(x => x.IncludedRemaining, -includedToDeduct)
            .Inc(x => x.PurchasedRemaining, -purchasedToDeduct)
            .Inc(x => x.Version, 1);

        var options = new FindOneAndUpdateOptions<CoachAiCredits>
        {
            ReturnDocument = ReturnDocument.After
        };

        return await context.CoachAiCredits.FindOneAndUpdateAsync(filter, update, options, ct);
    }

    public async Task Upsert(CoachAiCredits credits, CancellationToken ct)
    {
        await context.CoachAiCredits.ReplaceOneAsync(
            x => x.CoachUserId == credits.CoachUserId,
            credits,
            new ReplaceOptions { IsUpsert = true },
            ct);
    }
}
