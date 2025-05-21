using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.Domain.Database.Models;

public class User
{
    public Guid Id { get; set; }

    public string? GivenName { get; set; }

    public string? FamilyName { get; set; }

    public required Email Email { get; set; }

    public required string Password { get; set; }

    public required string PasswordSalt { get; set; }

    public bool IsCoach => Coach?.Stripe?.Status == StripeStatus.Succeeded;

    public bool IsAthlete => Athlete?.Stripe?.Status == StripeStatus.Succeeded;

    public UserAthlete? Athlete { get; set; }

    public UserCoach? Coach { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}