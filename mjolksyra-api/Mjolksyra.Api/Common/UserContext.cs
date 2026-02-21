using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.Api.Common;

public class UserContext : IUserContext
{
    private readonly Lazy<Guid?> _userId;

    public UserContext(IHttpContextAccessor accessor, IUserRepository userRepository)
    {
        IsAuthenticated = accessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
        Email = accessor.GetClaimValue("email");
        Name = accessor.GetClaimValue("name");
        GivenName = accessor.GetClaimValue("given_name");
        FamilyName = accessor.GetClaimValue("family_name");
        ClerkSubject = accessor.GetClaimValue("sub");

        _userId = new Lazy<Guid?>(() =>
        {
            if (ClerkSubject is null) return null;
            return userRepository.GetByClerkId(ClerkSubject, CancellationToken.None)
                .GetAwaiter().GetResult()?.Id;
        });
    }

    public bool IsAuthenticated { get; }

    public string? Email { get; }

    public string? Name { get; }

    public string? GivenName { get; }

    public string? FamilyName { get; }

    public string? ClerkSubject { get; }

    public Guid? UserId => _userId.Value;
}

file static class HttpContextAccessorExtensions
{
    public static string? GetClaimValue(this IHttpContextAccessor accessor, string type)
    {
        return accessor.HttpContext?.User.Claims.FirstOrDefault(x => x.Type == type)?.Value;
    }
}
