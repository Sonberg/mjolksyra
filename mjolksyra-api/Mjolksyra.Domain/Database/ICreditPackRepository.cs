using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface ICreditPackRepository
{
    Task<ICollection<CreditPack>> GetAll(CancellationToken ct);
    Task<CreditPack?> GetById(Guid id, CancellationToken ct);
    Task Upsert(CreditPack pack, CancellationToken ct);
}
