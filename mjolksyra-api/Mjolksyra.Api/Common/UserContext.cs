using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;
using System.Security.Claims;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Api.Common;

public class UserContext : IUserContext
{
    private readonly IUserRepository _userRepository;

    public UserContext(IHttpContextAccessor accessor, IUserRepository userRepository)
    {
        IsAuthenticated = accessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
        ClerkSubject = accessor.GetClaimValue("sub");

        _userRepository = userRepository;
    }

    public bool IsAuthenticated { get; }

    public string? ClerkSubject { get; }


    public async Task<User?> GetUser(CancellationToken cancellationToken = default)
    {
        if (ClerkSubject is null)
        {
            return null;
        }

        return await _userRepository.GetByClerkId(ClerkSubject, cancellationToken);
    }

    public async Task<Guid?> GetUserId(CancellationToken cancellationToken = default)
    {
        return (await GetUser(cancellationToken))?.Id;
    }
}

file static class HttpContextAccessorExtensions
{
    public static string? GetClaimValue(this IHttpContextAccessor accessor, string type)
    {
        var claims = accessor.HttpContext?.User.Claims;
        if (claims is null) return null;

        // Prefer raw JWT claim names (used by Clerk), but support ASP.NET mapped claim types too.
        var aliases = type switch
        {
            "sub" => new[]
            {
                "sub", ClaimTypes.NameIdentifier
            },
            "email" => new[]
            {
                "email", ClaimTypes.Email
            },
            "name" => new[]
            {
                "name", ClaimTypes.Name
            },
            "given_name" => new[]
            {
                "given_name", ClaimTypes.GivenName
            },
            "family_name" => new[]
            {
                "family_name", ClaimTypes.Surname
            },
            _ => new[]
            {
                type
            }
        };

        return claims.FirstOrDefault(x => aliases.Contains(x.Type))?.Value;
    }
}