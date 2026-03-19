using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.Domain.Database.Models;

public class AiCreditActionPricing
{
    public Guid Id { get; set; }
    public AiCreditAction Action { get; set; }
    public int CreditCost { get; set; }
}
