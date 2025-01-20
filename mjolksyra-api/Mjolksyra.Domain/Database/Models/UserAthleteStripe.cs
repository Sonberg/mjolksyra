using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.Domain.Database.Models;

public class UserAthleteStripe
{
    public string? CustomerId { get; set; }

    public StripeStatus Status { get; set; }

    public string? Message { get; set; }
}