using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.UseCases.Trainees.UpdateTrianeeCost;
using Stripe;

namespace Mjolksyra.UseCases.Tests.Trainees;

public class UpdateTraineeCostCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserIsNotCoach_DoesNothing()
    {
        var trainee = new Trainee
        {
            Id = Guid.NewGuid(),
            CoachUserId = Guid.NewGuid(),
            AthleteUserId = Guid.NewGuid(),
            Status = TraineeStatus.Active,
            Cost = new TraineeCost { Amount = 100 },
            CreatedAt = DateTimeOffset.UtcNow
        };

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(trainee.Id, It.IsAny<CancellationToken>())).ReturnsAsync(trainee);

        var sut = new UpdateTraineeCostCommandHandler(
            traineeRepository.Object,
            Mock.Of<IUserRepository>(),
            Mock.Of<IStripeClient>(),
            Mock.Of<IEmailSender>(),
            Mock.Of<INotificationService>());

        await sut.Handle(new UpdateTraineeCostCommand
        {
            TraineeId = trainee.Id,
            UserId = Guid.NewGuid(),
            Amount = 500
        }, CancellationToken.None);

        traineeRepository.Verify(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenSuppressPriceChangedNotification_DoesNotSendEmail()
    {
        var coachId = Guid.NewGuid();
        var athleteId = Guid.NewGuid();
        var trainee = new Trainee
        {
            Id = Guid.NewGuid(),
            CoachUserId = coachId,
            AthleteUserId = athleteId,
            Status = TraineeStatus.Active,
            Cost = new TraineeCost { Amount = 100 },
            CreatedAt = DateTimeOffset.UtcNow
        };
        var athlete = new User
        {
            Id = athleteId,
            ClerkUserId = "athlete",
            Email = Email.From("athlete@example.com"),
            GivenName = "Athlete",
            FamilyName = "A",
            CreatedAt = DateTimeOffset.UtcNow
        };
        var coach = new User
        {
            Id = coachId,
            ClerkUserId = "coach",
            Email = Email.From("coach@example.com"),
            GivenName = "Coach",
            FamilyName = "C",
            CreatedAt = DateTimeOffset.UtcNow
        };

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(trainee.Id, It.IsAny<CancellationToken>())).ReturnsAsync(trainee);
        traineeRepository.Setup(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee t, CancellationToken _) => t);

        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetById(athleteId, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        userRepository.Setup(x => x.GetById(coachId, It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var emailSender = new Mock<IEmailSender>();

        var sut = new UpdateTraineeCostCommandHandler(
            traineeRepository.Object,
            userRepository.Object,
            Mock.Of<IStripeClient>(),
            emailSender.Object,
            Mock.Of<INotificationService>());

        await sut.Handle(new UpdateTraineeCostCommand
        {
            TraineeId = trainee.Id,
            UserId = coachId,
            Amount = 500,
            SuppressPriceChangedNotification = true
        }, CancellationToken.None);

        Assert.Equal(500, trainee.Cost.Amount);
        traineeRepository.Verify(x => x.Update(trainee, It.IsAny<CancellationToken>()), Times.Once);
        emailSender.Verify(x => x.SendPriceChangedToAthlete(
            It.IsAny<string>(),
            It.IsAny<AthleteBillingEmail>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenStripeNotConfigured_StillSavesCost()
    {
        var coachId = Guid.NewGuid();
        var athleteId = Guid.NewGuid();
        var trainee = new Trainee
        {
            Id = Guid.NewGuid(),
            CoachUserId = coachId,
            AthleteUserId = athleteId,
            Status = TraineeStatus.Active,
            Cost = new TraineeCost { Amount = 100 },
            CreatedAt = DateTimeOffset.UtcNow
        };
        var athlete = new User
        {
            Id = athleteId,
            ClerkUserId = "athlete",
            Email = Email.From("athlete@example.com"),
            GivenName = "Athlete",
            FamilyName = "A",
            CreatedAt = DateTimeOffset.UtcNow
        };
        var coach = new User
        {
            Id = coachId,
            ClerkUserId = "coach",
            Email = Email.From("coach@example.com"),
            GivenName = "Coach",
            FamilyName = "C",
            CreatedAt = DateTimeOffset.UtcNow
        };

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(trainee.Id, It.IsAny<CancellationToken>())).ReturnsAsync(trainee);
        traineeRepository.Setup(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee t, CancellationToken _) => t);

        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetById(athleteId, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        userRepository.Setup(x => x.GetById(coachId, It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var stripeClient = new Mock<IStripeClient>();

        var sut = new UpdateTraineeCostCommandHandler(
            traineeRepository.Object,
            userRepository.Object,
            stripeClient.Object,
            Mock.Of<IEmailSender>(),
            Mock.Of<INotificationService>());

        await sut.Handle(new UpdateTraineeCostCommand
        {
            TraineeId = trainee.Id,
            UserId = coachId,
            Amount = 750,
            SuppressPriceChangedNotification = true
        }, CancellationToken.None);

        Assert.Equal(750, trainee.Cost.Amount);
        traineeRepository.Verify(x => x.Update(trainee, It.IsAny<CancellationToken>()), Times.Once);
        stripeClient.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task Handle_WhenAthleteIsNull_ReturnsEarly()
    {
        var coachId = Guid.NewGuid();
        var athleteId = Guid.NewGuid();
        var trainee = new Trainee
        {
            Id = Guid.NewGuid(),
            CoachUserId = coachId,
            AthleteUserId = athleteId,
            Status = TraineeStatus.Active,
            Cost = new TraineeCost { Amount = 100 },
            CreatedAt = DateTimeOffset.UtcNow
        };

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(trainee.Id, It.IsAny<CancellationToken>())).ReturnsAsync(trainee);
        traineeRepository.Setup(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee t, CancellationToken _) => t);

        var emailSender = new Mock<IEmailSender>();
        var notificationService = new Mock<INotificationService>();

        var sut = new UpdateTraineeCostCommandHandler(
            traineeRepository.Object,
            Mock.Of<IUserRepository>(),
            Mock.Of<IStripeClient>(),
            emailSender.Object,
            notificationService.Object);

        await sut.Handle(new UpdateTraineeCostCommand
        {
            TraineeId = trainee.Id,
            UserId = coachId,
            Amount = 900
        }, CancellationToken.None);

        Assert.Equal(900, trainee.Cost.Amount);
        traineeRepository.Verify(x => x.Update(trainee, It.IsAny<CancellationToken>()), Times.Once);
        emailSender.Verify(x => x.SendPriceChangedToAthlete(
            It.IsAny<string>(),
            It.IsAny<AthleteBillingEmail>(),
            It.IsAny<CancellationToken>()), Times.Never);
        notificationService.Verify(x => x.Notify(
            It.IsAny<Guid>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<string>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }
}

