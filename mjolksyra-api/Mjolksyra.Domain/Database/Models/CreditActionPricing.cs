using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.Domain.Database.Models;

public class CreditActionPricing
{
    public Guid Id { get; set; }
    public CreditAction Action { get; set; }
    public int CreditCost { get; set; }
}
