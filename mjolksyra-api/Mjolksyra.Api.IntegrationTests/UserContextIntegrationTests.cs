using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Mjolksyra.Api.Common;
using Mjolksyra.Domain.Clerk;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Api.IntegrationTests;

public class UserContextIntegrationTests
{
    [Fact]
    public async Task GetUser_WhenDatabaseUserMissing_ReturnsTransientUserFromClerk()
    {
        var userRepo = new FakeUserRepository();
        var clerkRepo = new FakeClerkRepository
        {
            Profile = new ClerkUserProfile
            {
                Email = "athlete@example.com",
                GivenName = "Ada",
                FamilyName = "Lovelace"
            }
        };

        var sut = CreateUserContext("clerk_123", userRepo, clerkRepo);

        var user = await sut.GetUser();

        Assert.NotNull(user);
        Assert.Equal(Guid.Empty, user!.Id);
        Assert.Equal("clerk_123", user.ClerkUserId);
        Assert.Equal("athlete@example.com", user.Email.Value);
        Assert.Equal("Ada", user.GivenName);
        Assert.Equal("Lovelace", user.FamilyName);
        Assert.Equal(1, userRepo.GetByClerkIdCalls);
        Assert.Equal(1, clerkRepo.GetUserCalls);
    }

    [Fact]
    public async Task GetUser_WhenPersistedUserMissingFields_BackfillsAndPersists()
    {
        var persisted = new User
        {
            Id = Guid.NewGuid(),
            ClerkUserId = "clerk_456",
            Email = Email.From("coach@example.com"),
            GivenName = null,
            FamilyName = null,
            CreatedAt = DateTimeOffset.UtcNow.AddDays(-10)
        };

        var userRepo = new FakeUserRepository
        {
            UserByClerkId = persisted
        };
        var clerkRepo = new FakeClerkRepository
        {
            Profile = new ClerkUserProfile
            {
                Email = "coach@example.com",
                GivenName = "Nils",
                FamilyName = "Berg"
            }
        };

        var sut = CreateUserContext("clerk_456", userRepo, clerkRepo);

        var user = await sut.GetUser();

        Assert.NotNull(user);
        Assert.Equal("coach@example.com", user!.Email.Value);
        Assert.Equal("Nils", user.GivenName);
        Assert.Equal("Berg", user.FamilyName);
        Assert.Equal(1, userRepo.UpdateCalls);
    }

    [Fact]
    public async Task GetUser_UsesCachedTask_AvoidsDuplicateDbAndClerkCalls()
    {
        var userRepo = new FakeUserRepository();
        var clerkRepo = new FakeClerkRepository
        {
            Profile = new ClerkUserProfile
            {
                Email = "cached@example.com"
            }
        };

        var sut = CreateUserContext("clerk_cached", userRepo, clerkRepo);

        var first = await sut.GetUser();
        var second = await sut.GetUser();
        var userId = await sut.GetUserId();

        Assert.Same(first, second);
        Assert.Equal(Guid.Empty, userId);
        Assert.Equal(1, userRepo.GetByClerkIdCalls);
        Assert.Equal(1, clerkRepo.GetUserCalls);
    }

    private static UserContext CreateUserContext(
        string clerkSubject,
        FakeUserRepository userRepo,
        FakeClerkRepository clerkRepo)
    {
        var http = new DefaultHttpContext();
        http.User = new ClaimsPrincipal(new ClaimsIdentity(
            new[]
            {
                new Claim("sub", clerkSubject)
            },
            authenticationType: "test"));

        return new UserContext(new HttpContextAccessor { HttpContext = http }, userRepo, clerkRepo);
    }

    private sealed class FakeClerkRepository : IClerkRepository
    {
        public ClerkUserProfile? Profile { get; set; }
        public int GetUserCalls { get; private set; }

        public Task<ClerkUserProfile?> GetUser(string clerkUserId, CancellationToken cancellationToken = default)
        {
            GetUserCalls++;
            return Task.FromResult(Profile);
        }
    }

    private sealed class FakeUserRepository : IUserRepository
    {
        public User? UserByClerkId { get; set; }
        public int GetByClerkIdCalls { get; private set; }
        public int UpdateCalls { get; private set; }

        public Task<User?> GetByEmail(string email, CancellationToken ct) => Task.FromResult<User?>(null);

        public Task<User?> GetByClerkId(string clerkUserId, CancellationToken ct)
        {
            GetByClerkIdCalls++;
            return Task.FromResult(UserByClerkId);
        }

        public Task<User> GetById(Guid id, CancellationToken ct) => throw new NotImplementedException();

        public Task<ICollection<User>> GetManyById(ICollection<Guid> ids, CancellationToken ct) =>
            throw new NotImplementedException();

        public Task<User> Create(User user, CancellationToken ct) => throw new NotImplementedException();

        public Task<User> Update(User user, CancellationToken ct)
        {
            UpdateCalls++;
            UserByClerkId = user;
            return Task.FromResult(user);
        }
    }
}
