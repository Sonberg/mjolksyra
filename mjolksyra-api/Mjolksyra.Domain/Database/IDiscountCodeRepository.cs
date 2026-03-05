using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IDiscountCodeRepository
{
    Task<DiscountCode?> GetByCode(string code, CancellationToken ct);

    Task<DiscountCode?> GetById(Guid id, CancellationToken ct);

    Task<ICollection<DiscountCode>> GetAllAsync(CancellationToken ct);

    Task<DiscountCode> Create(DiscountCode code, CancellationToken ct);

    Task<DiscountCode> Update(DiscountCode code, CancellationToken ct);
}
