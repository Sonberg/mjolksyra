namespace Mjolksyra.UseCases.Users;

public class UserInvitationResponse
{
    public required Guid Id { get; set; }

    public required string? GivenName { get; set; }

    public required string? FamilyName { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }
}