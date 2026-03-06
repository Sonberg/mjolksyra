using Moq;
using Mjolksyra.Domain;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Users;

namespace Mjolksyra.UseCases.Tests.Users;

public class GetUserRequestHandlerTests
{
    [Fact]
    public async Task Handle_WhenCoachHasDiscountCode_MapsDiscountCodeToDiscountResponse()
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
        var traineeRepository = new Mock<ITraineeRepository>();
        var traineeInvitationsRepository = new Mock<ITraineeInvitationsRepository>();
        var discountCodeRepository = new Mock<IDiscountCodeRepository>();

        userRepository
            .Setup(x => x.GetById(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);
        userRepository
            .Setup(x => x.GetManyById(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<User>());
        traineeRepository
            .Setup(x => x.Get(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Trainee>());
        traineeInvitationsRepository
            .Setup(x => x.GetAsync(user.Email.Value, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<TraineeInvitation>());
        discountCodeRepository
            .Setup(x => x.GetById(discountId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(discountCode);

        var sut = new GetUserRequestHandler(
            userRepository.Object,
            traineeRepository.Object,
            traineeInvitationsRepository.Object,
            discountCodeRepository.Object);

        var result = await sut.Handle(new GetUserRequest { UserId = userId }, CancellationToken.None);

        Assert.NotNull(result.Discount);
        Assert.Equal("SPRING50", result.Discount!.Code);
        Assert.Equal("50% off for three months", result.Discount.Description);
    }
}
