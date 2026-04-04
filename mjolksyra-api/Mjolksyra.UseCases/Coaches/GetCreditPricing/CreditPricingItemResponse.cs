using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.UseCases.Coaches.GetCreditPricing;

public class CreditPricingItemResponse
{
    public CreditAction Action { get; set; }

    public int CreditCost { get; set; }
}
