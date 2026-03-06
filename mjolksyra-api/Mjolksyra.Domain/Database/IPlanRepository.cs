using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IPlanRepository
{
    Task<List<Plan>> GetAllAsync(CancellationToken ct);
    Task<Plan?> GetById(Guid id, CancellationToken ct);
    Task Upsert(Plan plan, CancellationToken ct);
}
