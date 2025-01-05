namespace Mjolksyra.Domain.UserContext;

public interface IUserContext
{
    public bool IsAuthenticated { get; }

    public string? Email { get; }

    public string? Name { get; }

    public string? GivenName { get; }

    public string? FamilyName { get; }

    public Guid? UserId { get; }
}