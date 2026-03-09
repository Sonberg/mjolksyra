using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Users.HandleClerkUserDeleted;

namespace Mjolksyra.UseCases.Tests.Users;

public class HandleClerkUserDeletedCommandHandlerTests
{
    private static HandleClerkUserDeletedCommandHandler CreateHandler(
        IUserRepository? userRepository = null)
    {
        return new HandleClerkUserDeletedCommandHandler(
            userRepository ?? Mock.Of<IUserRepository>(),
            NullLogger<HandleClerkUserDeletedCommandHandler>.Instance);
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
    public async Task Handle_WhenUserNotFound_DoesNotCallUpdate()
    {
        var userRepository = new Mock<IUserRepository>();
        userRepository
            .Setup(x => x.GetByClerkId(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        var sut = CreateHandler(userRepository: userRepository.Object);

        await sut.Handle(new HandleClerkUserDeletedCommand
        {
            ClerkUserId = "clerk_unknown",
        }, CancellationToken.None);

        userRepository.Verify(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenUserFound_SetsDeletedAt()
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

        await sut.Handle(new HandleClerkUserDeletedCommand
        {
            ClerkUserId = user.ClerkUserId!,
        }, CancellationToken.None);

        userRepository.Verify(x => x.Update(
            It.Is<User>(u => u.DeletedAt != null),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
