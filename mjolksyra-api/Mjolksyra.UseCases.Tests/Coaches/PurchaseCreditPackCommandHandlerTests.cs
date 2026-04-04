using Moq;
using Mjolksyra.Domain;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Coaches.PurchaseCreditPack;

namespace Mjolksyra.UseCases.Tests.Coaches;

public class PurchaseCreditPackCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenPackNotFound_ReturnsError()
    {
        var packs = new Mock<ICreditPackRepository>();
        packs.Setup(x => x.GetById(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((CreditPack?)null);

        var sut = new PurchaseCreditPackCommandHandler(packs.Object, Mock.Of<IUserRepository>(), Mock.Of<IStripeCreditPackGateway>());

        var result = await sut.Handle(new PurchaseCreditPackCommand(Guid.NewGuid(), Guid.NewGuid()), CancellationToken.None);

        Assert.True(result.IsT1);
        Assert.Equal("Credit pack not found.", result.AsT1.Reason);
    }

    [Fact]
    public async Task Handle_WhenValid_PurchasesPack()
    {
        var coachUserId = Guid.NewGuid();
        var packId = Guid.NewGuid();
        var customerId = "cus_test";

        var packs = new Mock<ICreditPackRepository>();
        packs.Setup(x => x.GetById(packId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CreditPack
            {
                Id = packId,
                Name = "Small",
                Credits = 50,
                PriceSek = 99,
                IsActive = true,
            });

        var users = new Mock<IUserRepository>();
        users.Setup(x => x.GetById(coachUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User
            {
                Id = coachUserId,
                Email = Email.From("coach@example.com"),
                Coach = new UserCoach
                {
                    Stripe = new UserCoachStripe
                    {
                        PlatformCustomerId = customerId,
                    }
                },
                CreatedAt = DateTimeOffset.UtcNow,
            });

        var gateway = new Mock<IStripeCreditPackGateway>();

        var sut = new PurchaseCreditPackCommandHandler(packs.Object, users.Object, gateway.Object);

        var result = await sut.Handle(new PurchaseCreditPackCommand(coachUserId, packId), CancellationToken.None);

        Assert.True(result.IsT0);
        gateway.Verify(x => x.CreateAndPayInvoiceAsync(customerId, 9900, packId, coachUserId, It.IsAny<CancellationToken>()), Times.Once);
    }
}
