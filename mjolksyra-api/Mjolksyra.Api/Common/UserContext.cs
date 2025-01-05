using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.Api.Common;

public class UserContext : IUserContext
{
    public UserContext(IHttpContextAccessor accessor)
    {
        IsAuthenticated = accessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
        Email = accessor.GetClaimValue("email");
        Name = accessor.GetClaimValue("name");
        GivenName = accessor.GetClaimValue("givenName");
        FamilyName = accessor.GetClaimValue("familyName");
        UserId = accessor.GetClaimValue("userId") is { } userId ? Guid.Parse(userId) : null;
    }

    public bool IsAuthenticated { get; }
    
    public string? Email { get; }

    public string? Name { get; set; }

    public string? GivenName { get; set; }

    public string? FamilyName { get; set; }

    public Guid? UserId { get; set; }
}

file static class HttpContextAccessorExtensions
{
    public static string? GetClaimValue(this IHttpContextAccessor accessor, string type)
    {
        return accessor.HttpContext?.User.Claims.FirstOrDefault(x => x.Type == type)?.Value;
    }
}