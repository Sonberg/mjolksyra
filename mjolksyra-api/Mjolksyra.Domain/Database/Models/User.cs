namespace Mjolksyra.Domain.Database.Models;

public class User
{
    public Guid Id { get; set; }

    public string? GivenName { get; set; }

    public string? FamilyName { get; set; }

    public required string Email { get; set; }

    public required string Password { get; set; }

    public required string PasswordSalt { get; set; }

    public UserStripe? Stripe { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}