using MediatR;
using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.UseCases.Trainees.UpdateTrianeeCost;
using Mjolksyra.UseCases.TraineeInvitations.AcceptTraineeInvitation;
using Mjolksyra.UseCases.TraineeInvitations.DeclineTraineeInvitation;

namespace Mjolksyra.UseCases.Tests.TraineeInvitations;

public class InvitationDecisionHandlersTests
{
    [Fact]
    public async Task AcceptInvitation_WhenAlreadyConnected_AcceptsWithoutCreatingTrainee()
    {
        var invitation = CreateInvitation();
        var athlete = CreateUser(invitation.Email.Value);
        var coach = CreateUser("coach@example.com");
        invitation.CoachUserId = coach.Id;

        var invitations = new Mock<ITraineeInvitationsRepository>();
        invitations.Setup(x => x.GetByIdAsync(invitation.Id, It.IsAny<CancellationToken>())).ReturnsAsync(invitation);

        var users = new Mock<IUserRepository>();
        users.Setup(x => x.GetById(athlete.Id, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        users.Setup(x => x.GetById(coach.Id, It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var trainees = new Mock<ITraineeRepository>();
        trainees
            .Setup(x => x.GetRelationship(coach.Id, athlete.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = Guid.NewGuid(),
                CoachUserId = coach.Id,
                AthleteUserId = athlete.Id,
                Status = TraineeStatus.Active,
                Cost = new TraineeCost { Amount = 500 },
                CreatedAt = DateTimeOffset.UtcNow
            });
        var mediator = new Mock<IMediator>();

        var sut = new AcceptTraineeInvitationCommandHandler(
            trainees.Object,
            invitations.Object,
            users.Object,
            Mock.Of<IEmailSender>(),
            Mock.Of<INotificationService>(),
            mediator.Object);

        await sut.Handle(new AcceptTraineeInvitationCommand
        {
            TraineeInvitationId = invitation.Id,
            AthleteUserId = athlete.Id
        }, CancellationToken.None);

        invitations.Verify(x => x.AcceptAsync(invitation.Id, It.IsAny<CancellationToken>()), Times.Once);
        trainees.Verify(x => x.Create(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()), Times.Never);
        trainees.Verify(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task AcceptInvitation_WhenRelationshipExistsButCancelled_ReactivatesWithoutCreatingDuplicate()
    {
        var invitation = CreateInvitation();
        var athlete = CreateUser(invitation.Email.Value);
        var coach = CreateUser("coach@example.com");
        invitation.CoachUserId = coach.Id;

        var invitations = new Mock<ITraineeInvitationsRepository>();
        invitations.Setup(x => x.GetByIdAsync(invitation.Id, It.IsAny<CancellationToken>())).ReturnsAsync(invitation);

        var users = new Mock<IUserRepository>();
        users.Setup(x => x.GetById(athlete.Id, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        users.Setup(x => x.GetById(coach.Id, It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var existing = new Trainee
        {
            Id = Guid.NewGuid(),
            CoachUserId = coach.Id,
            AthleteUserId = athlete.Id,
            Status = TraineeStatus.Cancelled,
            Cost = new TraineeCost { Amount = 100 },
            CreatedAt = DateTimeOffset.UtcNow
        };

        var trainees = new Mock<ITraineeRepository>();
        trainees
            .Setup(x => x.GetRelationship(coach.Id, athlete.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existing);
        trainees
            .Setup(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee t, CancellationToken _) => t);

        var mediator = new Mock<IMediator>();
        var sut = new AcceptTraineeInvitationCommandHandler(
            trainees.Object,
            invitations.Object,
            users.Object,
            Mock.Of<IEmailSender>(),
            Mock.Of<INotificationService>(),
            mediator.Object);

        await sut.Handle(new AcceptTraineeInvitationCommand
        {
            TraineeInvitationId = invitation.Id,
            AthleteUserId = athlete.Id
        }, CancellationToken.None);

        trainees.Verify(x => x.Create(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()), Times.Never);
        trainees.Verify(x => x.Update(
            It.Is<Trainee>(t =>
                t.Id == existing.Id
                && t.Status == TraineeStatus.Active
                && t.TraineeInvitationId == invitation.Id
                && t.Cost.Amount == invitation.MonthlyPriceAmount),
            It.IsAny<CancellationToken>()), Times.Once);
        invitations.Verify(x => x.AcceptAsync(invitation.Id, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeclineInvitation_WhenEmailMismatch_DoesNothing()
    {
        var invitation = CreateInvitation();
        var athlete = CreateUser("other@example.com");
        var coach = CreateUser("coach@example.com");
        invitation.CoachUserId = coach.Id;

        var repository = new Mock<ITraineeInvitationsRepository>();
        repository.Setup(x => x.GetByIdAsync(invitation.Id, It.IsAny<CancellationToken>())).ReturnsAsync(invitation);

        var users = new Mock<IUserRepository>();
        users.Setup(x => x.GetById(athlete.Id, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        users.Setup(x => x.GetById(coach.Id, It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var sut = new DeclineTraineeInvitationCommandHandler(
            repository.Object,
            users.Object,
            Mock.Of<IEmailSender>(),
            Mock.Of<INotificationService>());

        await sut.Handle(new DeclineTraineeInvitationCommand
        {
            TraineeInvitationId = invitation.Id,
            AthleteUserId = athlete.Id
        }, CancellationToken.None);

        repository.Verify(x => x.RejectAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task AcceptInvitation_WhenAthletePaymentMethodConnected_TriggersSubscriptionSetup()
    {
        var invitation = CreateInvitation();
        var athlete = CreateUser(invitation.Email.Value);
        athlete.Athlete = new UserAthlete
        {
            Stripe = new UserAthleteStripe
            {
                Status = StripeStatus.Succeeded,
                CustomerId = "cus_123",
                PaymentMethodId = "pm_123",
            }
        };

        var coach = CreateUser("coach@example.com");
        coach.Coach = new UserCoach
        {
            Stripe = new UserCoachStripe
            {
                Status = StripeStatus.Succeeded,
                AccountId = "acct_123",
            }
        };
        invitation.CoachUserId = coach.Id;

        var invitations = new Mock<ITraineeInvitationsRepository>();
        invitations.Setup(x => x.GetByIdAsync(invitation.Id, It.IsAny<CancellationToken>())).ReturnsAsync(invitation);

        var users = new Mock<IUserRepository>();
        users.Setup(x => x.GetById(athlete.Id, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        users.Setup(x => x.GetById(coach.Id, It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var createdTraineeId = Guid.NewGuid();
        var trainees = new Mock<ITraineeRepository>();
        trainees
            .Setup(x => x.GetRelationship(coach.Id, athlete.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee?)null);
        trainees
            .Setup(x => x.Create(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee t, CancellationToken _) =>
            {
                t.Id = createdTraineeId;
                return t;
            });

        var mediator = new Mock<IMediator>();

        var sut = new AcceptTraineeInvitationCommandHandler(
            trainees.Object,
            invitations.Object,
            users.Object,
            Mock.Of<IEmailSender>(),
            Mock.Of<INotificationService>(),
            mediator.Object);

        await sut.Handle(new AcceptTraineeInvitationCommand
        {
            TraineeInvitationId = invitation.Id,
            AthleteUserId = athlete.Id
        }, CancellationToken.None);

        mediator.Verify(x => x.Send(
            It.Is<UpdateTraineeCostCommand>(c =>
                c.TraineeId == createdTraineeId
                && c.UserId == coach.Id
                && c.Amount == invitation.MonthlyPriceAmount
                && c.BillingMode == PriceChangeBillingMode.NextCycle
                && c.SuppressPriceChangedNotification),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    private static TraineeInvitation CreateInvitation()
    {
        return new TraineeInvitation
        {
            Id = Guid.NewGuid(),
            CoachUserId = Guid.NewGuid(),
            Email = Email.From("athlete@example.com"),
            MonthlyPriceAmount = 500,
            CreatedAt = DateTimeOffset.UtcNow
        };
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
