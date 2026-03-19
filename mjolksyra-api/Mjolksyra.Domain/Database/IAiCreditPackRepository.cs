using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IAiCreditPackRepository
{
    Task<ICollection<AiCreditPack>> GetAll(CancellationToken ct);
    Task<AiCreditPack?> GetById(Guid id, CancellationToken ct);
    Task Upsert(AiCreditPack pack, CancellationToken ct);
}
