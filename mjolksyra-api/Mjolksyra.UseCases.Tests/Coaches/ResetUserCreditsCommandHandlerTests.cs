using Moq;
using Mjolksyra.Domain;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Coaches.ResetUserCredits;

namespace Mjolksyra.UseCases.Tests.Coaches;

public class ResetUserCreditsCommandHandlerTests
{
    [Fact]
    public async Task Handle_ResetsIncludedCreditsBasedOnPlan()
    {
        var coachUserId = Guid.NewGuid();
        var planId = Guid.NewGuid();

        var userRepository = new Mock<IUserRepository>();
        userRepository
            .Setup(x => x.GetById(coachUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new User
            {
                Id = coachUserId,
                Email = Email.From("coach@example.com"),
                Coach = new UserCoach
                {
                    Stripe = new UserCoachStripe
                    {
                        PlanId = planId,
                    }
                },
                CreatedAt = DateTimeOffset.UtcNow,
            });

        var planRepository = new Mock<IPlanRepository>();
        planRepository
            .Setup(x => x.GetById(planId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Plan
            {
                Id = planId,
                Name = "Pro",
                IncludedAthletes = 12,
                MonthlyPriceSek = 399,
                ExtraAthletePriceSek = 39,
                IncludedCreditsPerCycle = 100,
                SortOrder = 2,
            });

        var creditsRepository = new Mock<IUserCreditsRepository>();
        creditsRepository
            .Setup(x => x.GetByCoachUserId(coachUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserCredits
            {
                Id = Guid.NewGuid(),
                CoachUserId = coachUserId,
                IncludedRemaining = 0,
                PurchasedRemaining = 8,
                Version = 2,
            });

        var ledgerRepository = new Mock<ICreditLedgerRepository>();

        var sut = new ResetUserCreditsCommandHandler(
            userRepository.Object,
            planRepository.Object,
            creditsRepository.Object,
            ledgerRepository.Object);

        await sut.Handle(new ResetUserCreditsCommand(coachUserId), CancellationToken.None);

        creditsRepository.Verify(x => x.Upsert(
            It.Is<UserCredits>(credits =>
                credits.IncludedRemaining == 100
                && credits.PurchasedRemaining == 8),
            It.IsAny<CancellationToken>()), Times.Once);

        ledgerRepository.Verify(x => x.Append(
            It.Is<CreditLedger>(entry =>
                entry.Type == CreditLedgerType.Reset
                && entry.IncludedCreditsChanged == 100),
            It.IsAny<CancellationToken>()), Times.Once);
    }
}
