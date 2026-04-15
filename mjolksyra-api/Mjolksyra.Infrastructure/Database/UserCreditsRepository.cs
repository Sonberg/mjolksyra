using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class UserCreditsRepository(IMongoDbContext context) : IUserCreditsRepository
{
    public async Task<UserCredits?> GetByCoachUserId(Guid coachUserId, CancellationToken ct)
    {
        return await context.UserCredits
            .Find(x => x.CoachUserId == coachUserId)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task Create(UserCredits credits, CancellationToken ct)
    {
        await context.UserCredits.InsertOneAsync(credits, new InsertOneOptions(), ct);
    }

    public async Task<UserCredits?> AtomicDeduct(
        Guid coachUserId,
        int includedToDeduct,
        int purchasedToDeduct,
        int expectedVersion,
        CancellationToken ct)
    {
        var filter = Builders<UserCredits>.Filter.And(
            Builders<UserCredits>.Filter.Eq(x => x.CoachUserId, coachUserId),
            Builders<UserCredits>.Filter.Eq(x => x.Version, expectedVersion));

        var update = Builders<UserCredits>.Update
            .Inc(x => x.IncludedRemaining, -includedToDeduct)
            .Inc(x => x.PurchasedRemaining, -purchasedToDeduct)
            .Inc(x => x.Version, 1);

        var options = new FindOneAndUpdateOptions<UserCredits>
        {
            ReturnDocument = ReturnDocument.After,
        };

        return await context.UserCredits.FindOneAndUpdateAsync(filter, update, options, ct);
    }

    public async Task<UserCredits?> AtomicReserve(
        Guid coachUserId,
        int includedToReserve,
        int purchasedToReserve,
        int expectedVersion,
        CancellationToken ct)
    {
        var filter = Builders<UserCredits>.Filter.And(
            Builders<UserCredits>.Filter.Eq(x => x.CoachUserId, coachUserId),
            Builders<UserCredits>.Filter.Eq(x => x.Version, expectedVersion));

        var update = Builders<UserCredits>.Update
            .Inc(x => x.IncludedReserved, includedToReserve)
            .Inc(x => x.PurchasedReserved, purchasedToReserve)
            .Inc(x => x.Version, 1);

        var options = new FindOneAndUpdateOptions<UserCredits>
        {
            ReturnDocument = ReturnDocument.After,
        };

        return await context.UserCredits.FindOneAndUpdateAsync(filter, update, options, ct);
    }

    public async Task<UserCredits?> AtomicSettle(
        Guid coachUserId,
        int includedToSettle,
        int purchasedToSettle,
        int expectedVersion,
        CancellationToken ct)
    {
        var filter = Builders<UserCredits>.Filter.And(
            Builders<UserCredits>.Filter.Eq(x => x.CoachUserId, coachUserId),
            Builders<UserCredits>.Filter.Eq(x => x.Version, expectedVersion));

        var update = Builders<UserCredits>.Update
            .Inc(x => x.IncludedRemaining, -includedToSettle)
            .Inc(x => x.IncludedReserved, -includedToSettle)
            .Inc(x => x.PurchasedRemaining, -purchasedToSettle)
            .Inc(x => x.PurchasedReserved, -purchasedToSettle)
            .Inc(x => x.Version, 1);

        var options = new FindOneAndUpdateOptions<UserCredits>
        {
            ReturnDocument = ReturnDocument.After,
        };

        return await context.UserCredits.FindOneAndUpdateAsync(filter, update, options, ct);
    }

    public async Task<UserCredits?> AtomicRelease(
        Guid coachUserId,
        int includedToRelease,
        int purchasedToRelease,
        int expectedVersion,
        CancellationToken ct)
    {
        var filter = Builders<UserCredits>.Filter.And(
            Builders<UserCredits>.Filter.Eq(x => x.CoachUserId, coachUserId),
            Builders<UserCredits>.Filter.Eq(x => x.Version, expectedVersion));

        var update = Builders<UserCredits>.Update
            .Inc(x => x.IncludedReserved, -includedToRelease)
            .Inc(x => x.PurchasedReserved, -purchasedToRelease)
            .Inc(x => x.Version, 1);

        var options = new FindOneAndUpdateOptions<UserCredits>
        {
            ReturnDocument = ReturnDocument.After,
        };

        return await context.UserCredits.FindOneAndUpdateAsync(filter, update, options, ct);
    }

    public async Task Upsert(UserCredits credits, CancellationToken ct)
    {
        await context.UserCredits.ReplaceOneAsync(
            x => x.CoachUserId == credits.CoachUserId,
            credits,
            new ReplaceOptions { IsUpsert = true },
            ct);
    }
}
