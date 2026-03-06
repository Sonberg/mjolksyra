using Moq;
using Mjolksyra.Domain;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;
using Mjolksyra.UseCases.Coaches.UpdateCoachPlan;

namespace Mjolksyra.UseCases.Tests.Coaches;

public class UpdateCoachPlanCommandHandlerTests
{
    private static Plan BuildProPlan() => new Plan
    {
        Id = Plan.ProPlanId,
        Name = "Pro",
        MonthlyPriceSek = 399,
        IncludedAthletes = 12,
        ExtraAthletePriceSek = 39,
        SortOrder = 2,
    };

    private static User BuildCoachUser(string? subscriptionId = null)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            ClerkUserId = "coach",
            Email = Email.From("coach@example.com"),
            GivenName = "Coach",
            FamilyName = "User",
            Coach = new UserCoach
            {
                Stripe = new UserCoachStripe
                {
                    AccountId = "acct_123",
                    Status = StripeStatus.Succeeded,
                    PlatformSubscriptionId = subscriptionId,
                }
            },
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    [Fact]
    public async Task Handle_WhenCoachHasNoSubscription_UpdatesPlanIdWithoutStripeCall()
    {
        var user = BuildCoachUser(subscriptionId: null);
        var plan = BuildProPlan();

        var userRepository = new Mock<IUserRepository>();
        var planRepository = new Mock<IPlanRepository>();
        var traineeRepository = new Mock<ITraineeRepository>();
        var stripeGateway = new Mock<ICoachPlatformBillingStripeGateway>();

        userRepository.Setup(x => x.GetById(user.Id, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        userRepository.Setup(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>())).ReturnsAsync((User u, CancellationToken _) => u);
        planRepository.Setup(x => x.GetById(plan.Id, It.IsAny<CancellationToken>())).ReturnsAsync(plan);

        var sut = new UpdateCoachPlanCommandHandler(
            userRepository.Object,
            planRepository.Object,
            traineeRepository.Object,
            stripeGateway.Object);

        await sut.Handle(new UpdateCoachPlanCommand(user.Id, plan.Id), CancellationToken.None);

        Assert.Equal(plan.Id, user.Coach!.Stripe!.PlanId);
        stripeGateway.Verify(
            x => x.UpdateSubscriptionPlanAsync(
                It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<int>(), It.IsAny<CancellationToken>()),
            Times.Never);
        userRepository.Verify(x => x.Update(user, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenCoachHasActiveSubscription_UpdatesPlanAndCallsStripe()
    {
        var user = BuildCoachUser(subscriptionId: "sub_active");
        var plan = BuildProPlan();

        var userRepository = new Mock<IUserRepository>();
        var planRepository = new Mock<IPlanRepository>();
        var traineeRepository = new Mock<ITraineeRepository>();
        var stripeGateway = new Mock<ICoachPlatformBillingStripeGateway>();

        userRepository.Setup(x => x.GetById(user.Id, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        userRepository.Setup(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>())).ReturnsAsync((User u, CancellationToken _) => u);
        planRepository.Setup(x => x.GetById(plan.Id, It.IsAny<CancellationToken>())).ReturnsAsync(plan);
        // 14 athletes, 12 included = 2 overage
        traineeRepository.Setup(x => x.CountActiveByCoachId(user.Id, It.IsAny<CancellationToken>())).ReturnsAsync(14);

        var sut = new UpdateCoachPlanCommandHandler(
            userRepository.Object,
            planRepository.Object,
            traineeRepository.Object,
            stripeGateway.Object);

        await sut.Handle(new UpdateCoachPlanCommand(user.Id, plan.Id), CancellationToken.None);

        Assert.Equal(plan.Id, user.Coach!.Stripe!.PlanId);
        stripeGateway.Verify(
            x => x.UpdateSubscriptionPlanAsync(
                user.Id,
                "sub_active",
                39900L,
                3900L,
                2,
                It.IsAny<CancellationToken>()),
            Times.Once);
        userRepository.Verify(x => x.Update(user, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenPlanIdIsInvalid_DoesNothing()
    {
        var user = BuildCoachUser();
        var unknownPlanId = Guid.NewGuid();

        var userRepository = new Mock<IUserRepository>();
        var planRepository = new Mock<IPlanRepository>();
        var traineeRepository = new Mock<ITraineeRepository>();
        var stripeGateway = new Mock<ICoachPlatformBillingStripeGateway>();

        userRepository.Setup(x => x.GetById(user.Id, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        planRepository.Setup(x => x.GetById(unknownPlanId, It.IsAny<CancellationToken>())).ReturnsAsync((Plan?)null);

        var sut = new UpdateCoachPlanCommandHandler(
            userRepository.Object,
            planRepository.Object,
            traineeRepository.Object,
            stripeGateway.Object);

        await sut.Handle(new UpdateCoachPlanCommand(user.Id, unknownPlanId), CancellationToken.None);

        userRepository.Verify(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
        stripeGateway.Verify(
            x => x.UpdateSubscriptionPlanAsync(
                It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<long>(), It.IsAny<long>(), It.IsAny<int>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }
}
