using MediatR;
using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.UseCases.Trainees.ChargeNowTrainee;
using Mjolksyra.UseCases.Trainees.UpdateTrianeeCost;

namespace Mjolksyra.UseCases.Tests.Trainees;

public class ChargeNowTraineeCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenTraineeMissing_DoesNothing()
    {
        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((Trainee?)null);

        var mediator = new Mock<IMediator>();
        var sut = new ChargeNowTraineeCommandHandler(
            traineeRepository.Object,
            Mock.Of<IUserRepository>(),
            mediator.Object,
            Mock.Of<IEmailSender>(),
            Mock.Of<INotificationService>());

        await sut.Handle(new ChargeNowTraineeCommand
        {
            TraineeId = Guid.NewGuid(),
            UserId = Guid.NewGuid()
        }, CancellationToken.None);

        mediator.Verify(x => x.Send(It.IsAny<UpdateTraineeCostCommand>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenBillingReady_SendsUpdateCostCommand()
    {
        var coachId = Guid.NewGuid();
        var athleteId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var trainee = new Trainee
        {
            Id = traineeId,
            CoachUserId = coachId,
            AthleteUserId = athleteId,
            Status = TraineeStatus.Active,
            Cost = new TraineeCost { Amount = 600 },
            CreatedAt = DateTimeOffset.UtcNow
        };

        var athlete = new User
        {
            Id = athleteId,
            ClerkUserId = "athlete",
            Email = Email.From("athlete@example.com"),
            GivenName = "Athlete",
            FamilyName = "A",
            Athlete = new UserAthlete
            {
                Stripe = new UserAthleteStripe
                {
                    CustomerId = "cus_1",
                    PaymentMethodId = "pm_1",
                    Status = StripeStatus.Succeeded
                }
            },
            CreatedAt = DateTimeOffset.UtcNow
        };

        var coach = new User
        {
            Id = coachId,
            ClerkUserId = "coach",
            Email = Email.From("coach@example.com"),
            GivenName = "Coach",
            FamilyName = "C",
            Coach = new UserCoach
            {
                Stripe = new UserCoachStripe
                {
                    AccountId = "acct_1",
                    Status = StripeStatus.Succeeded
                }
            },
            CreatedAt = DateTimeOffset.UtcNow
        };

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>())).ReturnsAsync(trainee);

        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetById(athleteId, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        userRepository.Setup(x => x.GetById(coachId, It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var mediator = new Mock<IMediator>();
        mediator.Setup(x => x.Send(It.IsAny<UpdateTraineeCostCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var sut = new ChargeNowTraineeCommandHandler(
            traineeRepository.Object,
            userRepository.Object,
            mediator.Object,
            Mock.Of<IEmailSender>(),
            Mock.Of<INotificationService>());

        await sut.Handle(new ChargeNowTraineeCommand
        {
            TraineeId = traineeId,
            UserId = coachId
        }, CancellationToken.None);

        mediator.Verify(x => x.Send(
            It.Is<UpdateTraineeCostCommand>(c =>
                c.TraineeId == traineeId &&
                c.UserId == coachId &&
                c.Amount == trainee.Cost.Amount &&
                c.SuppressPriceChangedNotification),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
