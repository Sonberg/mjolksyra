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
}
