using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IAiCreditActionPricingRepository
{
    Task<AiCreditActionPricing?> GetByAction(AiCreditAction action, CancellationToken ct);
    Task Upsert(AiCreditActionPricing pricing, CancellationToken ct);
}
