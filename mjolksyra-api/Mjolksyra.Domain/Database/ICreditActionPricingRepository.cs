using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface ICreditActionPricingRepository
{
    Task<CreditActionPricing?> GetByAction(CreditAction action, CancellationToken ct);

    Task Upsert(CreditActionPricing pricing, CancellationToken ct);
}
