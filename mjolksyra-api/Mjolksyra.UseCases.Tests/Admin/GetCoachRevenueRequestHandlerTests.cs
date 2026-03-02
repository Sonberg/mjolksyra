using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Admin.GetCoachRevenue;

namespace Mjolksyra.UseCases.Tests.Admin;

public class GetCoachRevenueRequestHandlerTests
{
    [Fact]
    public async Task Handle_ComputesRevenueAndPlatformFeeStatusPerCoach()
    {
        var coachAId = Guid.NewGuid();
        var coachBId = Guid.NewGuid();

        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetCoachUsersAsync(It.IsAny<CancellationToken>())).ReturnsAsync([
            new User
            {
                Id = coachAId,
                Email = Email.From("coach.a@example.com"),
                GivenName = "Coach",
                FamilyName = "Alpha",
                Coach = new UserCoach
                {
                    Stripe = new UserCoachStripe
                    {
                        Status = StripeStatus.Succeeded,
                        PlatformSubscriptionId = "sub_123",
                        TrialEndsAt = DateTimeOffset.UtcNow.AddDays(5),
                    }
                }
            },
            new User
            {
                Id = coachBId,
                Email = Email.From("coach.b@example.com"),
                Coach = new UserCoach
                {
                    Stripe = new UserCoachStripe
                    {
                        Status = StripeStatus.Succeeded,
                    }
                }
            }
        ]);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([
            new Trainee
            {
                CoachUserId = coachAId,
                AthleteUserId = Guid.NewGuid(),
                Id = Guid.NewGuid(),
                Status = TraineeStatus.Active,
                Cost = new TraineeCost { Amount = 600 },
                Transactions =
                [
                    new TraineeTransaction
                    {
                        Id = Guid.NewGuid(),
                        PaymentIntentId = "pi_1",
                        Status = TraineeTransactionStatus.Succeeded,
                        Cost = new TraineeTransactionCost { Total = 600, Currency = "SEK" },
                        CreatedAt = DateTimeOffset.UtcNow,
                    }
                ]
            },
            new Trainee
            {
                CoachUserId = coachAId,
                AthleteUserId = Guid.NewGuid(),
                Id = Guid.NewGuid(),
                Status = TraineeStatus.Cancelled,
                Cost = new TraineeCost { Amount = 450 },
                Transactions =
                [
                    new TraineeTransaction
                    {
                        Id = Guid.NewGuid(),
                        PaymentIntentId = "pi_2",
                        Status = TraineeTransactionStatus.Succeeded,
                        Cost = new TraineeTransactionCost { Total = 450, Currency = "SEK" },
                        CreatedAt = DateTimeOffset.UtcNow,
                    }
                ]
            },
            new Trainee
            {
                CoachUserId = coachBId,
                AthleteUserId = Guid.NewGuid(),
                Id = Guid.NewGuid(),
                Status = TraineeStatus.Active,
                Cost = new TraineeCost { Amount = 300 },
                Transactions =
                [
                    new TraineeTransaction
                    {
                        Id = Guid.NewGuid(),
                        PaymentIntentId = "pi_3",
                        Status = TraineeTransactionStatus.Failed,
                        Cost = new TraineeTransactionCost { Total = 300, Currency = "SEK" },
                        CreatedAt = DateTimeOffset.UtcNow,
                    }
                ]
            }
        ]);

        var sut = new GetCoachRevenueRequestHandler(userRepository.Object, traineeRepository.Object);

        var result = (await sut.Handle(new GetCoachRevenueRequest(), CancellationToken.None)).ToList();

        Assert.Equal(2, result.Count);

        var coachA = result.First(x => x.CoachUserId == coachAId);
        Assert.Equal("Coach Alpha", coachA.CoachName);
        Assert.Equal(1, coachA.ActiveSubscriptions);
        Assert.Equal(600m, coachA.MonthlyAthleteRevenue);
        Assert.Equal(1050m, coachA.TotalAthleteRevenue);
        Assert.Equal("Configured", coachA.BillingSetupStatus);
        Assert.Equal("Trialing", coachA.PlatformFeeStatus);

        var coachB = result.First(x => x.CoachUserId == coachBId);
        Assert.Equal("coach.b@example.com", coachB.CoachName);
        Assert.Equal(1, coachB.ActiveSubscriptions);
        Assert.Equal(300m, coachB.MonthlyAthleteRevenue);
        Assert.Equal(0m, coachB.TotalAthleteRevenue);
        Assert.Equal("Needs action", coachB.BillingSetupStatus);
        Assert.Equal("Not subscribed", coachB.PlatformFeeStatus);
    }

    [Fact]
    public async Task Handle_WhenStripeNotReady_ReturnsStripeNotReadyStatus()
    {
        var coachId = Guid.NewGuid();

        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetCoachUsersAsync(It.IsAny<CancellationToken>())).ReturnsAsync([
            new User
            {
                Id = coachId,
                Email = Email.From("coach@example.com"),
                Coach = new UserCoach
                {
                    Stripe = new UserCoachStripe
                    {
                        Status = StripeStatus.RequiresAction,
                    }
                }
            }
        ]);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);

        var sut = new GetCoachRevenueRequestHandler(userRepository.Object, traineeRepository.Object);

        var result = await sut.Handle(new GetCoachRevenueRequest(), CancellationToken.None);

        var item = Assert.Single(result);
        Assert.Equal("Needs action", item.BillingSetupStatus);
        Assert.Equal("Stripe not ready", item.PlatformFeeStatus);
    }
}
