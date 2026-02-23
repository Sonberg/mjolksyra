namespace Mjolksyra.Domain.Clerk;

public class ClerkUserProfile
{
    public string? Email { get; init; }

    public string? GivenName { get; init; }

    public string? FamilyName { get; init; }
}

public interface IClerkRepository
{
    Task<ClerkUserProfile?> GetUser(string clerkUserId, CancellationToken cancellationToken = default);
}
