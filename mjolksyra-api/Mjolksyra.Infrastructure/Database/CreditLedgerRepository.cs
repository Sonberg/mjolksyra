using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class CreditLedgerRepository(IMongoDbContext context) : ICreditLedgerRepository
{
    public async Task Append(CreditLedger entry, CancellationToken ct)
    {
        await context.CreditLedger.InsertOneAsync(entry, new InsertOneOptions(), ct);
    }

    public async Task<ICollection<CreditLedger>> GetByCoachUserId(
        Guid coachUserId,
        int limit,
        DateTimeOffset? before,
        CancellationToken ct)
    {
        var filter = Builders<CreditLedger>.Filter.Eq(x => x.CoachUserId, coachUserId);

        if (before.HasValue)
        {
            filter = Builders<CreditLedger>.Filter.And(
                filter,
                Builders<CreditLedger>.Filter.Lt(x => x.CreatedAt, before.Value));
        }

        return await context.CreditLedger
            .Find(filter)
            .SortByDescending(x => x.CreatedAt)
            .Limit(limit)
            .ToListAsync(ct);
    }
}
