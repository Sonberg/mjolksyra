using Moq;
using Mjolksyra.Domain;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;

namespace Mjolksyra.UseCases.Tests.Coaches;

public class EnsureCoachPlatformSubscriptionCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenCoachStripeIsNotReady_DoesNothing()
    {
        var user = BuildCoachUser();
        user.Coach!.Stripe!.Status = StripeStatus.RequiresAction;

        var userRepository = new Mock<IUserRepository>();
        userRepository
            .Setup(x => x.GetById(user.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        var stripeGateway = new Mock<ICoachPlatformBillingStripeGateway>();
        var sut = new EnsureCoachPlatformSubscriptionCommandHandler(userRepository.Object, stripeGateway.Object);

        await sut.Handle(new EnsureCoachPlatformSubscriptionCommand(user.Id), CancellationToken.None);

        stripeGateway.Verify(
            x => x.CreateCustomerAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.IsAny<string?>(),
                It.IsAny<string?>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
        stripeGateway.Verify(
            x => x.CreateSubscriptionAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
        userRepository.Verify(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenActivePlatformSubscriptionExists_DoesNothing()
    {
        var user = BuildCoachUser();
        user.Coach!.Stripe!.PlatformSubscriptionId = "sub_active";
        user.Coach.Stripe.PlatformCustomerId = "cus_existing";

        var userRepository = new Mock<IUserRepository>();
        userRepository
            .Setup(x => x.GetById(user.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        var stripeGateway = new Mock<ICoachPlatformBillingStripeGateway>();
        stripeGateway
            .Setup(x => x.HasActiveSubscriptionAsync("sub_active", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var sut = new EnsureCoachPlatformSubscriptionCommandHandler(userRepository.Object, stripeGateway.Object);

        await sut.Handle(new EnsureCoachPlatformSubscriptionCommand(user.Id), CancellationToken.None);

        stripeGateway.Verify(
            x => x.CreateCustomerAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.IsAny<string?>(),
                It.IsAny<string?>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
        stripeGateway.Verify(
            x => x.CreateSubscriptionAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
        userRepository.Verify(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenReadyAndNoSubscription_CreatesCustomerAndSubscription()
    {
        var user = BuildCoachUser();

        var userRepository = new Mock<IUserRepository>();
        userRepository
            .Setup(x => x.GetById(user.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        userRepository
            .Setup(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User u, CancellationToken _) => u);

        var stripeGateway = new Mock<ICoachPlatformBillingStripeGateway>();
        stripeGateway
            .Setup(x => x.CreateCustomerAsync(
                user.Id,
                user.Email.Value,
                user.GivenName,
                user.FamilyName,
                It.IsAny<CancellationToken>()))
            .ReturnsAsync("cus_created");
        stripeGateway
            .Setup(x => x.CreateSubscriptionAsync(user.Id, "cus_created", It.IsAny<CancellationToken>()))
            .ReturnsAsync("sub_created");

        var sut = new EnsureCoachPlatformSubscriptionCommandHandler(userRepository.Object, stripeGateway.Object);

        await sut.Handle(new EnsureCoachPlatformSubscriptionCommand(user.Id), CancellationToken.None);

        Assert.Equal("cus_created", user.Coach!.Stripe!.PlatformCustomerId);
        Assert.Equal("sub_created", user.Coach.Stripe.PlatformSubscriptionId);
        userRepository.Verify(x => x.Update(user, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenSubscriptionIdExistsButInactive_RecreatesSubscription()
    {
        var user = BuildCoachUser();
        user.Coach!.Stripe!.PlatformCustomerId = "cus_existing";
        user.Coach.Stripe.PlatformSubscriptionId = "sub_inactive";

        var userRepository = new Mock<IUserRepository>();
        userRepository
            .Setup(x => x.GetById(user.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        userRepository
            .Setup(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User u, CancellationToken _) => u);

        var stripeGateway = new Mock<ICoachPlatformBillingStripeGateway>();
        stripeGateway
            .Setup(x => x.HasActiveSubscriptionAsync("sub_inactive", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);
        stripeGateway
            .Setup(x => x.CreateSubscriptionAsync(user.Id, "cus_existing", It.IsAny<CancellationToken>()))
            .ReturnsAsync("sub_new");

        var sut = new EnsureCoachPlatformSubscriptionCommandHandler(userRepository.Object, stripeGateway.Object);

        await sut.Handle(new EnsureCoachPlatformSubscriptionCommand(user.Id), CancellationToken.None);

        Assert.Equal("sub_new", user.Coach.Stripe.PlatformSubscriptionId);
        stripeGateway.Verify(
            x => x.CreateCustomerAsync(
                It.IsAny<Guid>(),
                It.IsAny<string>(),
                It.IsAny<string?>(),
                It.IsAny<string?>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
        userRepository.Verify(x => x.Update(user, It.IsAny<CancellationToken>()), Times.Once);
    }

    private static User BuildCoachUser()
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
                    Message = "Ready"
                }
            },
            CreatedAt = DateTimeOffset.UtcNow
        };
    }
}
