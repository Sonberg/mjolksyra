using Microsoft.Extensions.Caching.Hybrid;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class TraineeRepository : ITraineeRepository
{
    private readonly IMongoDbContext _context;

    private readonly HybridCache _cache;

    public TraineeRepository(IMongoDbContext context, HybridCache cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<Trainee> Create(Trainee trainee, CancellationToken ct)
    {
        await _context.Trainees.InsertOneAsync(trainee, new InsertOneOptions(), ct);

        return trainee;
    }

    public async Task<Trainee> Update(Trainee trainee, CancellationToken ct)
    {
        await _context.Trainees.ReplaceOneAsync(x => x.Id == trainee.Id, trainee, new ReplaceOptions
        {
            IsUpsert = false
        }, ct);

        return trainee;
    }

    public async Task<Trainee?> GetById(Guid traineeId, CancellationToken ct)
    {
        return await _context.Trainees.Find(x => x.Id == traineeId)
            .ToListAsync(cancellationToken: ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task<ICollection<Trainee>> Get(Guid userId, CancellationToken ct)
    {
        var filters = Builders<Trainee>.Filter.Or([
            Builders<Trainee>.Filter.Eq(x => x.AthleteUserId, userId),
            Builders<Trainee>.Filter.Eq(x => x.CoachUserId, userId)
        ]);

        return await _context.Trainees
            .Find(filters)
            .ToListAsync(ct);
    }

    public async Task<Trainee?> GetBySubscriptionId(string subscriptionId, CancellationToken ct)
    {
        return await _context.Trainees
            .Find(x => x.StripeSubscriptionId == subscriptionId)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task<bool> HasAccess(Guid traineeId, Guid userId, CancellationToken cancellationToken)
    {
        return await _cache.GetOrCreateAsync($"HasAccess_{traineeId}_{userId}",
            async _ =>
            {
                return await _context.Trainees
                    .Find(x => x.Id == traineeId && (x.CoachUserId == userId || x.AthleteUserId == userId))
                    .AnyAsync(cancellationToken: cancellationToken);
            },
            cancellationToken: cancellationToken);
    }

    public async Task<int> CountActiveByCoachId(Guid coachUserId, CancellationToken ct)
    {
        return (int)await _context.Trainees.CountDocumentsAsync(
            x => x.CoachUserId == coachUserId && x.Status == TraineeStatus.Active,
            cancellationToken: ct);
    }

    public async Task<bool> ExistsActiveRelationship(Guid coachUserId, Guid athleteUserId, CancellationToken ct)
    {
        return await _context.Trainees.Find(x =>
                x.CoachUserId == coachUserId &&
                x.AthleteUserId == athleteUserId &&
                x.Status == TraineeStatus.Active)
            .AnyAsync(ct);
    }

    public async Task<long> CountActiveAsync(CancellationToken ct)
    {
        return await _context.Trainees.CountDocumentsAsync(
            x => x.Status == TraineeStatus.Active,
            cancellationToken: ct);
    }

    public async Task<decimal> TotalRevenueAsync(CancellationToken ct)
    {
        var pipeline = new BsonDocument[]
        {
            new("$unwind", "$transactions"),
            new("$match", new BsonDocument("transactions.status", "Succeeded")),
            new("$group", new BsonDocument
            {
                { "_id", BsonNull.Value },
                { "total", new BsonDocument("$sum", "$transactions.cost.total") }
            })
        };

        var result = await _context.Trainees
            .Aggregate<BsonDocument>(pipeline, cancellationToken: ct)
            .FirstOrDefaultAsync(ct);

        if (result == null || !result.Contains("total")) return 0m;
        return (decimal)result["total"].ToInt32();
    }
}
