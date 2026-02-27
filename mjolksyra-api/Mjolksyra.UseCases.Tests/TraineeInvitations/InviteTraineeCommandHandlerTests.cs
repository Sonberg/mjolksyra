using Microsoft.Extensions.Configuration;
using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.UseCases.TraineeInvitations.InviteTrainee;

namespace Mjolksyra.UseCases.Tests.TraineeInvitations;

public class InviteTraineeCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenMonthlyPriceIsInvalid_ReturnsInvalidMonthlyPriceError()
    {
        var sut = CreateHandler();

        var result = await sut.Handle(new InviteTraineeCommand
        {
            CoachUserId = Guid.NewGuid(),
            Email = "athlete@example.com",
            MonthlyPriceAmount = 0
        }, CancellationToken.None);

        Assert.Equal(InviteTraineeErrorCode.InvalidMonthlyPrice, result.AsT1.Code);
    }

    [Fact]
    public async Task Handle_WhenRelationshipIsMissing_ReturnsRelationshipRequiredError()
    {
        var athlete = CreateUser("athlete@example.com");
        var coach = CreateUser("coach@example.com");

        var users = new Mock<IUserRepository>();
        users.Setup(x => x.GetByEmail("athlete@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        users.Setup(x => x.GetById(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var trainees = new Mock<ITraineeRepository>();
        trainees
            .Setup(x => x.ExistsActiveRelationship(It.IsAny<Guid>(), athlete.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var sut = CreateHandler(userRepository: users.Object, traineeRepository: trainees.Object);

        var result = await sut.Handle(new InviteTraineeCommand
        {
            CoachUserId = Guid.NewGuid(),
            Email = "athlete@example.com",
            MonthlyPriceAmount = 1000
        }, CancellationToken.None);

        Assert.Equal(InviteTraineeErrorCode.RelationshipRequired, result.AsT1.Code);
    }

    [Fact]
    public async Task Handle_WhenPendingInviteExists_ReturnsPendingInviteAlreadyExistsError()
    {
        var athlete = CreateUser("athlete@example.com");
        var coach = CreateUser("coach@example.com");

        var users = new Mock<IUserRepository>();
        users.Setup(x => x.GetByEmail("athlete@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        users.Setup(x => x.GetById(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var trainees = new Mock<ITraineeRepository>();
        trainees
            .Setup(x => x.ExistsActiveRelationship(It.IsAny<Guid>(), athlete.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var invites = new Mock<ITraineeInvitationsRepository>();
        invites
            .Setup(x => x.CountPendingByCoachAndEmailAsync(It.IsAny<Guid>(), "athlete@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var sut = CreateHandler(
            invitationsRepository: invites.Object,
            userRepository: users.Object,
            traineeRepository: trainees.Object);

        var result = await sut.Handle(new InviteTraineeCommand
        {
            CoachUserId = Guid.NewGuid(),
            Email = "athlete@example.com",
            MonthlyPriceAmount = 1000
        }, CancellationToken.None);

        Assert.Equal(InviteTraineeErrorCode.PendingInviteAlreadyExists, result.AsT1.Code);
    }

    private static InviteTraineeCommandHandler CreateHandler(
        ITraineeInvitationsRepository? invitationsRepository = null,
        IUserRepository? userRepository = null,
        ITraineeRepository? traineeRepository = null)
    {
        var invites = invitationsRepository ?? Mock.Of<ITraineeInvitationsRepository>();
        var users = userRepository ?? Mock.Of<IUserRepository>();
        var trainees = traineeRepository ?? Mock.Of<ITraineeRepository>();
        var email = Mock.Of<IEmailSender>();
        var notifications = Mock.Of<INotificationService>();
        var configuration = new Mock<IConfiguration>();
        configuration.SetupGet(x => x["App:BaseUrl"]).Returns("http://localhost:3000");

        return new InviteTraineeCommandHandler(
            invites,
            users,
            email,
            notifications,
            configuration.Object,
            trainees);
    }

    private static User CreateUser(string email)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = Email.From(email),
            GivenName = "Test",
            FamilyName = "User",
            ClerkUserId = "clerk_test",
            CreatedAt = DateTimeOffset.UtcNow
        };
    }
}
