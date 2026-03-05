using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class TraineeTransactionRepository(IMongoDbContext context) : ITraineeTransactionRepository
{
    public async Task<ICollection<TraineeTransaction>> GetByTraineeId(Guid traineeId, CancellationToken ct)
    {
        return await context.TraineeTransactions
            .Find(x => x.TraineeId == traineeId)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<ICollection<TraineeTransaction>> GetAllAsync(CancellationToken ct)
    {
        return await context.TraineeTransactions
            .Find(Builders<TraineeTransaction>.Filter.Empty)
            .ToListAsync(ct);
    }

    public async Task<TraineeTransaction?> GetById(Guid id, CancellationToken ct)
    {
        return await context.TraineeTransactions
            .Find(x => x.Id == id)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task<TraineeTransaction?> GetByPaymentIntentId(string paymentIntentId, CancellationToken ct)
    {
        return await context.TraineeTransactions
            .Find(x => x.PaymentIntentId == paymentIntentId)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task Upsert(TraineeTransaction transaction, CancellationToken ct)
    {
        var existing = await GetByPaymentIntentId(transaction.PaymentIntentId, ct);
        if (existing is not null)
        {
            transaction.Id = existing.Id;
        }
        else if (transaction.Id == Guid.Empty)
        {
            transaction.Id = Guid.NewGuid();
        }

        await context.TraineeTransactions.ReplaceOneAsync(
            x => x.Id == transaction.Id,
            transaction,
            new ReplaceOptions { IsUpsert = true },
            ct);
    }

    public async Task<decimal> TotalRevenueAsync(CancellationToken ct)
    {
        var pipeline = new BsonDocument[]
        {
            new("$match", new BsonDocument("status", "Succeeded")),
            new("$group", new BsonDocument
            {
                { "_id", BsonNull.Value },
                { "total", new BsonDocument("$sum", "$cost.total") }
            })
        };

        var result = await context.TraineeTransactions
            .Aggregate<BsonDocument>(pipeline, cancellationToken: ct)
            .FirstOrDefaultAsync(ct);

        if (result == null || !result.Contains("total")) return 0m;
        return (decimal)result["total"].ToInt32();
    }
}
