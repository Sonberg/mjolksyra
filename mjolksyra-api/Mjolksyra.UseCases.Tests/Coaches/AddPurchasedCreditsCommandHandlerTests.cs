using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Coaches.AddPurchasedCredits;

namespace Mjolksyra.UseCases.Tests.Coaches;

public class AddPurchasedCreditsCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenNoBalanceExists_CreatesUserCreditsAndLedger()
    {
        var coachUserId = Guid.NewGuid();
        var packId = Guid.NewGuid();

        var packRepo = new Mock<ICreditPackRepository>();
        packRepo.Setup(x => x.GetById(packId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CreditPack
            {
                Id = packId,
                Name = "Small",
                Credits = 50,
                PriceSek = 99,
                IsActive = true,
            });

        var creditsRepo = new Mock<IUserCreditsRepository>();
        creditsRepo.Setup(x => x.GetByCoachUserId(coachUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserCredits?)null);

        var ledgerRepo = new Mock<ICreditLedgerRepository>();

        var sut = new AddPurchasedCreditsCommandHandler(packRepo.Object, creditsRepo.Object, ledgerRepo.Object);

        await sut.Handle(new AddPurchasedCreditsCommand(coachUserId, packId, "evt_1"), CancellationToken.None);

        creditsRepo.Verify(x => x.Create(
            It.Is<UserCredits>(credits =>
                credits.CoachUserId == coachUserId
                && credits.IncludedRemaining == 0
                && credits.PurchasedRemaining == 50),
            It.IsAny<CancellationToken>()), Times.Once);

        ledgerRepo.Verify(x => x.Append(
            It.Is<CreditLedger>(entry =>
                entry.CoachUserId == coachUserId
                && entry.Type == CreditLedgerType.Purchase
                && entry.PurchasedCreditsChanged == 50
                && entry.IdempotencyKey == "evt_1"),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
