using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class AiCreditLedgerRepository(IMongoDbContext context) : IAiCreditLedgerRepository
{
    public async Task Append(AiCreditLedger entry, CancellationToken ct)
    {
        await context.AiCreditLedger.InsertOneAsync(entry, new InsertOneOptions(), ct);
    }
}
