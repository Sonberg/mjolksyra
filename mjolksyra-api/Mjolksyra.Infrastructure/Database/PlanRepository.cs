using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class PlanRepository(IMongoDbContext context) : IPlanRepository
{
    public async Task<List<Plan>> GetAllAsync(CancellationToken ct)
    {
        return await context.Plans
            .Find(_ => true)
            .SortBy(x => x.SortOrder)
            .ToListAsync(ct);
    }

    public async Task<Plan?> GetById(Guid id, CancellationToken ct)
    {
        return await context.Plans
            .Find(x => x.Id == id)
            .FirstOrDefaultAsync(ct);
    }

    public async Task Upsert(Plan plan, CancellationToken ct)
    {
        await context.Plans.ReplaceOneAsync(
            x => x.Id == plan.Id,
            plan,
            new ReplaceOptions { IsUpsert = true },
            ct);
    }
}
