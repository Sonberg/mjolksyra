using Moq;
using Mjolksyra.Domain;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Coaches.ApplyDiscountCode;
using Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;

namespace Mjolksyra.UseCases.Tests.Coaches;

public class ApplyDiscountCodeCommandHandlerTests
{
    [Fact]
    public async Task Handle_UsesTrimmedCodeForLookup()
    {
        var userId = Guid.NewGuid();
        var discountCode = new DiscountCode
        {
            Id = Guid.NewGuid(),
            Code = "FRIENDS",
            StripeCouponId = "coupon_123",
            Description = "desc",
            IsActive = true,
            RedeemedCount = 0,
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var user = new User
        {
            Id = userId,
            ClerkUserId = "clerk_1",
            Email = Email.From("coach@example.com"),
            GivenName = "Coach",
            FamilyName = "User",
            Coach = new UserCoach
            {
                Stripe = new UserCoachStripe
                {
                    Status = StripeStatus.Succeeded,
                    PlatformSubscriptionId = null,
                }
            },
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var discountCodeRepository = new Mock<IDiscountCodeRepository>();
        var userRepository = new Mock<IUserRepository>();
        var stripeGateway = new Mock<ICoachPlatformBillingStripeGateway>();

        discountCodeRepository
            .Setup(x => x.GetByCode("friends", It.IsAny<CancellationToken>()))
            .ReturnsAsync(discountCode);
        discountCodeRepository
            .Setup(x => x.Update(It.IsAny<DiscountCode>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((DiscountCode d, CancellationToken _) => d);
        userRepository
            .Setup(x => x.GetById(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        userRepository
            .Setup(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User u, CancellationToken _) => u);

        var sut = new ApplyDiscountCodeCommandHandler(
            discountCodeRepository.Object,
            userRepository.Object,
            stripeGateway.Object);

        var result = await sut.Handle(new ApplyDiscountCodeCommand
        {
            UserId = userId,
            Code = "  friends  ",
        }, CancellationToken.None);

        Assert.True(result.IsT0);
        Assert.Equal(1, discountCode.RedeemedCount);
        discountCodeRepository.Verify(x => x.GetByCode("friends", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenCodeIsWhitespace_ReturnsNotFound()
    {
        var discountCodeRepository = new Mock<IDiscountCodeRepository>();
        var userRepository = new Mock<IUserRepository>();
        var stripeGateway = new Mock<ICoachPlatformBillingStripeGateway>();

        var sut = new ApplyDiscountCodeCommandHandler(
            discountCodeRepository.Object,
            userRepository.Object,
            stripeGateway.Object);

        var result = await sut.Handle(new ApplyDiscountCodeCommand
        {
            UserId = Guid.NewGuid(),
            Code = "   ",
        }, CancellationToken.None);

        Assert.True(result.IsT1);
        discountCodeRepository.Verify(x => x.GetByCode(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
