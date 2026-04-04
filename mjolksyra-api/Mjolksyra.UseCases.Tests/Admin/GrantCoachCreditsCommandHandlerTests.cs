using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Admin.GrantCoachCredits;

namespace Mjolksyra.UseCases.Tests.Admin;

public class GrantCoachCreditsCommandHandlerTests
{
    [Fact]
    public async Task Handle_AddsPurchasedCreditsAndWritesAdminGrantLedger()
    {
        var coachUserId = Guid.NewGuid();

        var creditsRepository = new Mock<IUserCreditsRepository>();
        creditsRepository
            .Setup(x => x.GetByCoachUserId(coachUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserCredits
            {
                Id = Guid.NewGuid(),
                CoachUserId = coachUserId,
                IncludedRemaining = 10,
                PurchasedRemaining = 4,
                Version = 1,
            });

        var ledgerRepository = new Mock<ICreditLedgerRepository>();

        var sut = new GrantCoachCreditsCommandHandler(creditsRepository.Object, ledgerRepository.Object);

        await sut.Handle(new GrantCoachCreditsCommand(coachUserId, 20, "Support goodwill"), CancellationToken.None);

        creditsRepository.Verify(x => x.Upsert(
            It.Is<UserCredits>(credits => credits.PurchasedRemaining == 24),
            It.IsAny<CancellationToken>()), Times.Once);

        ledgerRepository.Verify(x => x.Append(
            It.Is<CreditLedger>(entry =>
                entry.Type == CreditLedgerType.AdminGrant
                && entry.PurchasedCreditsChanged == 20
                && entry.ReferenceId == "Support goodwill"),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
