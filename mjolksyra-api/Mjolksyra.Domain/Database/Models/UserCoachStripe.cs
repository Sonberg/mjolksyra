using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.Domain.Database.Models;

public class UserCoachStripe
{
    public string? AccountId { get; set; }

    public StripeStatus Status { get; set; }

    public string? Message { get; set; }
}