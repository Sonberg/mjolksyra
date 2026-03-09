using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Users.HandleClerkUserCreated;

namespace Mjolksyra.UseCases.Tests.Users;

public class HandleClerkUserCreatedCommandHandlerTests
{
    private static HandleClerkUserCreatedCommandHandler CreateHandler(
        IUserRepository? userRepository = null)
    {
        return new HandleClerkUserCreatedCommandHandler(
            userRepository ?? Mock.Of<IUserRepository>());
    }

    private static User BuildUser(string clerkUserId = "clerk_123", string email = "user@example.com")
    {
        return new User
        {
            Id = Guid.NewGuid(),
            ClerkUserId = clerkUserId,
            Email = Email.From(email),
            GivenName = "Test",
            FamilyName = "User",
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    [Fact]
    public async Task Handle_WhenUserDoesNotExist_CreatesUser()
    {
        var userRepository = new Mock<IUserRepository>();
        userRepository
            .Setup(x => x.GetByClerkId(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);
        userRepository
            .Setup(x => x.Create(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User u, CancellationToken _) => u);

        var sut = CreateHandler(userRepository: userRepository.Object);

        await sut.Handle(new HandleClerkUserCreatedCommand
        {
            ClerkUserId = "clerk_123",
            Email = "new@example.com",
            GivenName = "Alice",
            FamilyName = "Smith",
        }, CancellationToken.None);

        userRepository.Verify(x => x.Create(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenUserAlreadyExists_DoesNotCreateUser()
    {
        var existing = BuildUser();

        var userRepository = new Mock<IUserRepository>();
        userRepository
            .Setup(x => x.GetByClerkId(existing.ClerkUserId!, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);

        var sut = CreateHandler(userRepository: userRepository.Object);

        await sut.Handle(new HandleClerkUserCreatedCommand
        {
            ClerkUserId = existing.ClerkUserId!,
            Email = existing.Email.Value,
        }, CancellationToken.None);

        userRepository.Verify(x => x.Create(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
