using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Users.HandleClerkUserUpdated;

namespace Mjolksyra.UseCases.Tests.Users;

public class HandleClerkUserUpdatedCommandHandlerTests
{
    private static HandleClerkUserUpdatedCommandHandler CreateHandler(
        IUserRepository? userRepository = null)
    {
        return new HandleClerkUserUpdatedCommandHandler(
            userRepository ?? Mock.Of<IUserRepository>(),
            NullLogger<HandleClerkUserUpdatedCommandHandler>.Instance);
    }

    private static User BuildUser(string clerkUserId = "clerk_123", string email = "user@example.com")
    {
        return new User
        {
            Id = Guid.NewGuid(),
            ClerkUserId = clerkUserId,
            Email = Email.From(email),
            GivenName = "Old",
            FamilyName = "Name",
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    [Fact]
    public async Task Handle_WhenUserNotFound_DoesNotCallUpdate()
    {
        var userRepository = new Mock<IUserRepository>();
        userRepository
            .Setup(x => x.GetByClerkId(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var sut = CreateHandler(userRepository: userRepository.Object);

        await sut.Handle(new HandleClerkUserUpdatedCommand
        {
            ClerkUserId = "clerk_unknown",
            Email = "unknown@example.com",
        }, CancellationToken.None);

        userRepository.Verify(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenUserFound_UpdatesNameAndEmail()
    {
        var user = BuildUser();

        var userRepository = new Mock<IUserRepository>();
        userRepository
            .Setup(x => x.GetByClerkId(user.ClerkUserId!, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        userRepository
            .Setup(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User u, CancellationToken _) => u);

        var sut = CreateHandler(userRepository: userRepository.Object);

        await sut.Handle(new HandleClerkUserUpdatedCommand
        {
            ClerkUserId = user.ClerkUserId!,
            Email = "updated@example.com",
            GivenName = "Alice",
            FamilyName = "Updated",
        }, CancellationToken.None);

        userRepository.Verify(x => x.Update(
            It.Is<User>(u =>
                u.GivenName == "Alice" &&
                u.FamilyName == "Updated" &&
                u.Email.Value == "updated@example.com"),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
