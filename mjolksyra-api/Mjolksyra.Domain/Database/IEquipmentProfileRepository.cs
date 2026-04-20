using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IEquipmentProfileRepository
{
    Task<EquipmentProfile?> GetByUserId(Guid userId, CancellationToken ct);

    Task<EquipmentProfile> Upsert(EquipmentProfile profile, CancellationToken ct);
}
