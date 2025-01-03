namespace Mjolksyra.Domain.Database.Models;

public class UserInvitation
{
    public Guid Id { get; set; }

    public required string Email { get; set; }

    public required string Token { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? AcceptedAt { get; set; }

    public DateTimeOffset ExpiresAt => CreatedAt.AddDays(7);
}