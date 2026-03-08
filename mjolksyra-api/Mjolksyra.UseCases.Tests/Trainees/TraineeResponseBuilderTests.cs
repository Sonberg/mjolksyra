using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Trainees;
using Stripe;

namespace Mjolksyra.UseCases.Tests.Trainees;

public class TraineeResponseBuilderTests
{
    private static readonly Guid AthleteId = Guid.NewGuid();
    private static readonly Guid CoachId = Guid.NewGuid();

    private static TraineeResponseBuilder CreateBuilder()
    {
        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(x => x.GetById(AthleteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildUser(AthleteId, withPaymentMethod: true));
        userRepo.Setup(x => x.GetById(CoachId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildUser(CoachId, withStripeAccount: true));

        var workoutRepo = new Mock<IPlannedWorkoutRepository>();
        workoutRepo.Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [] });

        var txRepo = new Mock<ITraineeTransactionRepository>();
        txRepo.Setup(x => x.GetByTraineeId(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<TraineeTransaction>());

        // SubscriptionService.GetAsync will throw (no real Stripe client) — builder catches and falls back
        var stripeClient = Mock.Of<IStripeClient>();

        return new TraineeResponseBuilder(userRepo.Object, workoutRepo.Object, stripeClient, txRepo.Object);
    }

    private static Trainee BuildTrainee(string? subscriptionId = null, DateTimeOffset? paymentFailedAt = null) => new()
    {
        Id = Guid.NewGuid(),
        AthleteUserId = AthleteId,
        CoachUserId = CoachId,
        Status = TraineeStatus.Active,
        Cost = new TraineeCost { Amount = 500 },
        StripeSubscriptionId = subscriptionId,
        PaymentFailedAt = paymentFailedAt,
        CreatedAt = DateTimeOffset.UtcNow
    };

    private static User BuildUser(Guid id, bool withPaymentMethod = false, bool withStripeAccount = false)
    {
        var user = new User
        {
            Id = id,
            ClerkUserId = id.ToString(),
            Email = Email.From("user@example.com"),
            GivenName = "Test",
            FamilyName = "User",
            CreatedAt = DateTimeOffset.UtcNow
        };

        if (withPaymentMethod)
        {
            user.Athlete = new UserAthlete
            {
                Stripe = new UserAthleteStripe
                {
                    PaymentMethodId = "pm_test",
                    Status = StripeStatus.Succeeded
                }
            };
        }

        if (withStripeAccount)
        {
            user.Coach = new UserCoach
            {
                Stripe = new UserCoachStripe
                {
                    AccountId = "acct_test",
                    Status = StripeStatus.Succeeded
                }
            };
        }

        return user;
    }

    [Fact]
    public async Task Build_WhenSubscriptionActiveAndPaymentFailedAtSet_ReturnsBillingStatusPaymentFailed()
    {
        var trainee = BuildTrainee(subscriptionId: "sub_test", paymentFailedAt: DateTimeOffset.UtcNow.AddDays(-1));
        var sut = CreateBuilder();

        var result = await sut.Build(trainee, CancellationToken.None);

        Assert.Equal(TraineeBillingStatus.PaymentFailed, result.Billing.Status);
    }

    [Fact]
    public async Task Build_WhenSubscriptionActiveAndPaymentFailedAtNull_ReturnsBillingStatusSubscriptionActive()
    {
        var trainee = BuildTrainee(subscriptionId: "sub_test", paymentFailedAt: null);
        var sut = CreateBuilder();

        var result = await sut.Build(trainee, CancellationToken.None);

        Assert.Equal(TraineeBillingStatus.SubscriptionActive, result.Billing.Status);
    }

    [Fact]
    public async Task Build_WhenNoSubscriptionAndNoPrice_ReturnsBillingStatusPriceNotSet()
    {
        var trainee = BuildTrainee(subscriptionId: null);
        trainee.Cost = new TraineeCost { Amount = 0 };
        var sut = CreateBuilder();

        var result = await sut.Build(trainee, CancellationToken.None);

        Assert.Equal(TraineeBillingStatus.PriceNotSet, result.Billing.Status);
    }
}
