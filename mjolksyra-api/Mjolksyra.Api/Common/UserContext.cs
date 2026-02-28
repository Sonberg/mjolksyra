using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;
using System.Security.Claims;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Clerk;

namespace Mjolksyra.Api.Common;

public class UserContext : IUserContext
{
    private readonly IUserRepository _userRepository;
    private readonly IClerkRepository _clerkRepository;
    private readonly Lazy<Task<User?>> _userTask;
    private readonly Lazy<Task<Guid?>> _userIdTask;
    private readonly Lazy<Task<bool>> _isAdminTask;

    public UserContext(
        IHttpContextAccessor accessor,
        IUserRepository userRepository,
        IClerkRepository clerkRepository)
    {
        IsAuthenticated = accessor.HttpContext?.User.Identity?.IsAuthenticated ?? false;
        ClerkSubject = accessor.GetClaimValue("sub");

        _userRepository = userRepository;
        _clerkRepository = clerkRepository;

        _userTask = new Lazy<Task<User?>>(LoadUserAsync);
        _userIdTask = new Lazy<Task<Guid?>>(async () => (await _userTask.Value)?.Id);
        _isAdminTask = new Lazy<Task<bool>>(async () => (await _userTask.Value)?.IsAdmin == true);
    }

    public bool IsAuthenticated { get; }

    public string? ClerkSubject { get; }

    public Task<User?> GetUser(CancellationToken cancellationToken = default)
    {
        return _userTask.Value;
    }

    public Task<Guid?> GetUserId(CancellationToken cancellationToken = default)
    {
        return _userIdTask.Value;
    }

    public Task<bool> IsAdminAsync(CancellationToken cancellationToken = default)
    {
        return _isAdminTask.Value;
    }


    private async Task<User?> LoadUserAsync()
    {
        if (ClerkSubject is null)
        {
            return null;
        }

        var user = await _userRepository.GetByClerkId(ClerkSubject, CancellationToken.None);
        var needsProfile =
            user?.ClerkUserId is null ||
            string.IsNullOrWhiteSpace(user.Email.Value) ||
            (string.IsNullOrWhiteSpace(user.GivenName) && string.IsNullOrWhiteSpace(user.FamilyName));

        if (!needsProfile)
        {
            return user;
        }

        var profile = await _clerkRepository.GetUser(ClerkSubject, CancellationToken.None);
        if (profile is null || string.IsNullOrWhiteSpace(profile.Email))
        {
            return user;
        }

        if (user is null)
        {
            // First sign-in: transient user object so EnsureUser can create the persisted record.
            return new User
            {
                Id = Guid.Empty,
                ClerkUserId = ClerkSubject,
                Email = Email.From(profile.Email),
                GivenName = profile.GivenName,
                FamilyName = profile.FamilyName,
                CreatedAt = DateTimeOffset.UtcNow
            };
        }

        var changed = false;
        if (string.IsNullOrWhiteSpace(user.ClerkUserId))
        {
            user.ClerkUserId = ClerkSubject;
            changed = true;
        }

        if (string.IsNullOrWhiteSpace(user.GivenName) && !string.IsNullOrWhiteSpace(profile.GivenName))
        {
            user.GivenName = profile.GivenName;
            changed = true;
        }

        if (string.IsNullOrWhiteSpace(user.FamilyName) && !string.IsNullOrWhiteSpace(profile.FamilyName))
        {
            user.FamilyName = profile.FamilyName;
            changed = true;
        }

        if (string.IsNullOrWhiteSpace(user.Email.Value))
        {
            user.Email = Email.From(profile.Email);
            changed = true;
        }

        if (changed)
        {
            user = await _userRepository.Update(user, CancellationToken.None);
        }

        return user;
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