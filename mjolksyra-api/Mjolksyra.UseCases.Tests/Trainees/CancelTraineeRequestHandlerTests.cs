using MediatR;
using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;
using Mjolksyra.UseCases.Trainees.CancelTrainee;

namespace Mjolksyra.UseCases.Tests.Trainees;

public class CancelTraineeRequestHandlerTests
{
    private static CancelTraineeRequestHandler CreateHandler(
        ITraineeRepository? traineeRepository = null,
        IUserRepository? userRepository = null,
        IMediator? mediator = null,
        IEmailSender? emailSender = null,
        INotificationService? notificationService = null)
    {
        return new CancelTraineeRequestHandler(
            traineeRepository ?? Mock.Of<ITraineeRepository>(),
            Mock.Of<Stripe.IStripeClient>(),
            userRepository ?? Mock.Of<IUserRepository>(),
            emailSender ?? Mock.Of<IEmailSender>(),
            notificationService ?? Mock.Of<INotificationService>(),
            mediator ?? Mock.Of<IMediator>());
    }

    private static Trainee BuildActiveTrainee(Guid? coachId = null, Guid? athleteId = null)
    {
        return new Trainee
        {
            Id = Guid.NewGuid(),
            CoachUserId = coachId ?? Guid.NewGuid(),
            AthleteUserId = athleteId ?? Guid.NewGuid(),
            Status = TraineeStatus.Active,
            Cost = new TraineeCost { Amount = 500 },
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    private static User BuildUser(Guid id, string email = "user@example.com")
    {
        return new User
        {
            Id = id,
            ClerkUserId = id.ToString(),
            Email = Email.From(email),
            GivenName = "Test",
            FamilyName = "User",
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    [Fact]
    public async Task Handle_WhenTraineeNotFound_DoesNothing()
    {
        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee?)null);

        var sut = CreateHandler(traineeRepository: traineeRepository.Object);

        await sut.Handle(new CancelTraineeRequest
        {
            TraineeId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        }, CancellationToken.None);

        traineeRepository.Verify(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenUserIsNotCoachOrAthlete_DoesNothing()
    {
        var trainee = BuildActiveTrainee();

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(trainee.Id, It.IsAny<CancellationToken>())).ReturnsAsync(trainee);

        var sut = CreateHandler(traineeRepository: traineeRepository.Object);

        await sut.Handle(new CancelTraineeRequest
        {
            TraineeId = trainee.Id,
            UserId = Guid.NewGuid()
        }, CancellationToken.None);

        traineeRepository.Verify(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenAlreadyCancelled_DoesNothing()
    {
        var coachId = Guid.NewGuid();
        var trainee = BuildActiveTrainee(coachId: coachId);
        trainee.Status = TraineeStatus.Cancelled;

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(trainee.Id, It.IsAny<CancellationToken>())).ReturnsAsync(trainee);

        var sut = CreateHandler(traineeRepository: traineeRepository.Object);

        await sut.Handle(new CancelTraineeRequest
        {
            TraineeId = trainee.Id,
            UserId = coachId
        }, CancellationToken.None);

        traineeRepository.Verify(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenNoSubscription_CancelsLocally()
    {
        var coachId = Guid.NewGuid();
        var athleteId = Guid.NewGuid();
        var trainee = BuildActiveTrainee(coachId: coachId, athleteId: athleteId);
        var coach = BuildUser(coachId, "coach@example.com");
        var athlete = BuildUser(athleteId, "athlete@example.com");

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(trainee.Id, It.IsAny<CancellationToken>())).ReturnsAsync(trainee);
        traineeRepository.Setup(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee t, CancellationToken _) => t);

        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetById(coachId, It.IsAny<CancellationToken>())).ReturnsAsync(coach);
        userRepository.Setup(x => x.GetById(athleteId, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);

        var mediator = new Mock<IMediator>();
        mediator.Setup(x => x.Send(It.IsAny<EnsureCoachPlatformSubscriptionCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var emailSender = new Mock<IEmailSender>();

        var sut = CreateHandler(
            traineeRepository: traineeRepository.Object,
            userRepository: userRepository.Object,
            mediator: mediator.Object,
            emailSender: emailSender.Object);

        await sut.Handle(new CancelTraineeRequest
        {
            TraineeId = trainee.Id,
            UserId = coachId
        }, CancellationToken.None);

        Assert.Equal(TraineeStatus.Cancelled, trainee.Status);
        Assert.NotNull(trainee.DeletedAt);
        traineeRepository.Verify(x => x.Update(trainee, It.IsAny<CancellationToken>()), Times.Once);
        emailSender.Verify(x => x.SendRelationshipCancelled(
            athlete.Email.Value, It.IsAny<RelationshipCancelledEmail>(), It.IsAny<CancellationToken>()), Times.Once);
        emailSender.Verify(x => x.SendRelationshipCancelled(
            coach.Email.Value, It.IsAny<RelationshipCancelledEmail>(), It.IsAny<CancellationToken>()), Times.Once);
        mediator.Verify(x => x.Send(
            It.Is<EnsureCoachPlatformSubscriptionCommand>(c => c.UserId == coachId),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
