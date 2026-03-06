using Moq;
using Mjolksyra.Domain;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Coaches.GetAppliedDiscountCode;

namespace Mjolksyra.UseCases.Tests.Coaches;

public class GetAppliedDiscountCodeQueryHandlerTests
{
    [Fact]
    public async Task Handle_WhenDiscountExists_ReturnsDiscountAndStripeConfiguration()
    {
        var userId = Guid.NewGuid();
        var discountId = Guid.NewGuid();

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
                    DiscountCodeId = discountId.ToString(),
                    PlatformSubscriptionId = "sub_123",
                }
            },
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var discountCode = new DiscountCode
        {
            Id = discountId,
            Code = "SPRING50",
            Description = "50% off for three months",
            StripeCouponId = "coupon_123",
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var userRepository = new Mock<IUserRepository>();
        var discountCodeRepository = new Mock<IDiscountCodeRepository>();
        var stripeGateway = new Mock<ICoachDiscountConfigurationStripeGateway>();

        userRepository.Setup(x => x.GetById(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        discountCodeRepository.Setup(x => x.GetById(discountId, It.IsAny<CancellationToken>())).ReturnsAsync(discountCode);
        stripeGateway.Setup(x => x.GetAppliedDiscountAsync("sub_123", "coupon_123", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new StripeCouponConfiguration(
                CouponId: "coupon_123",
                PromotionCodeId: "promo_456",
                Name: "Spring Promo",
                PercentOff: 50,
                AmountOff: null,
                Currency: null,
                Duration: "repeating",
                DurationInMonths: 3,
                Valid: true));

        var sut = new GetAppliedDiscountCodeQueryHandler(
            userRepository.Object,
            discountCodeRepository.Object,
            stripeGateway.Object);

        var result = await sut.Handle(new GetAppliedDiscountCodeQuery(userId), CancellationToken.None);

        Assert.Equal("SPRING50", result.Code);
        Assert.Equal("50% off for three months", result.Description);
        Assert.Equal("coupon_123", result.StripeCouponId);
        Assert.Equal("promo_456", result.StripePromotionCodeId);
        Assert.NotNull(result.StripeCoupon);
        Assert.Equal("Spring Promo", result.StripeCoupon!.Name);
        Assert.Equal(50, result.StripeCoupon.PercentOff);
        Assert.Equal("repeating", result.StripeCoupon.Duration);
        Assert.Equal(3, result.StripeCoupon.DurationInMonths);
        Assert.True(result.StripeCoupon.Valid);
    }

    [Fact]
    public async Task Handle_WhenNoDiscountCodeConfigured_ReturnsEmptyPayload()
    {
        var userId = Guid.NewGuid();
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
                    PlatformSubscriptionId = "sub_123",
                }
            },
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var userRepository = new Mock<IUserRepository>();
        var discountCodeRepository = new Mock<IDiscountCodeRepository>();
        var stripeGateway = new Mock<ICoachDiscountConfigurationStripeGateway>();

        userRepository.Setup(x => x.GetById(userId, It.IsAny<CancellationToken>())).ReturnsAsync(user);
        stripeGateway.Setup(x => x.GetAppliedDiscountAsync("sub_123", null, It.IsAny<CancellationToken>()))
            .ReturnsAsync((StripeCouponConfiguration?)null);

        var sut = new GetAppliedDiscountCodeQueryHandler(
            userRepository.Object,
            discountCodeRepository.Object,
            stripeGateway.Object);

        var result = await sut.Handle(new GetAppliedDiscountCodeQuery(userId), CancellationToken.None);

        Assert.Null(result.Code);
        Assert.Null(result.Description);
        Assert.Null(result.StripeCouponId);
        Assert.Null(result.StripePromotionCodeId);
        Assert.Null(result.StripeCoupon);
    }
}
