using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Coaches.ConsumeCredits;

namespace Mjolksyra.UseCases.Tests.Coaches;

public class ConsumeCreditsCommandHandlerTests
{
    private static ConsumeCreditsCommandHandler CreateHandler(
        Mock<IUserCreditsRepository> creditsRepo,
        Mock<ICreditActionPricingRepository> pricingRepo,
        Mock<ICreditLedgerRepository> ledgerRepo)
        => new(creditsRepo.Object, pricingRepo.Object, ledgerRepo.Object);

    [Fact]
    public async Task Handle_InsufficientCredits_ReturnsError()
    {
        var coachId = Guid.NewGuid();
        var pricingRepo = new Mock<ICreditActionPricingRepository>();
        var creditsRepo = new Mock<IUserCreditsRepository>();
        var ledgerRepo = new Mock<ICreditLedgerRepository>();

        pricingRepo.Setup(r => r.GetByAction(CreditAction.AnalyzeWorkoutMedia, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CreditActionPricing
            {
                Id = Guid.NewGuid(),
                Action = CreditAction.AnalyzeWorkoutMedia,
                CreditCost = 5,
            });
        creditsRepo.Setup(r => r.GetByCoachUserId(coachId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserCredits
            {
                Id = Guid.NewGuid(),
                CoachUserId = coachId,
                IncludedRemaining = 2,
                PurchasedRemaining = 1,
            });

        var handler = CreateHandler(creditsRepo, pricingRepo, ledgerRepo);
        var result = await handler.Handle(new ConsumeCreditsCommand(coachId, CreditAction.AnalyzeWorkoutMedia), default);

        Assert.True(result.IsT1);
        Assert.Contains("Insufficient", result.AsT1.Reason);
    }

    [Fact]
    public async Task Handle_Success_DeductsCreditsAndWritesLedger()
    {
        var coachId = Guid.NewGuid();
        var pricingRepo = new Mock<ICreditActionPricingRepository>();
        var creditsRepo = new Mock<IUserCreditsRepository>();
        var ledgerRepo = new Mock<ICreditLedgerRepository>();

        pricingRepo.Setup(r => r.GetByAction(CreditAction.AnalyzeWorkoutMedia, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CreditActionPricing
            {
                Id = Guid.NewGuid(),
                Action = CreditAction.AnalyzeWorkoutMedia,
                CreditCost = 5,
            });

        creditsRepo.Setup(r => r.GetByCoachUserId(coachId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserCredits
            {
                Id = Guid.NewGuid(),
                CoachUserId = coachId,
                IncludedRemaining = 3,
                PurchasedRemaining = 4,
                Version = 2,
            });

        creditsRepo.Setup(r => r.AtomicDeduct(coachId, 3, 2, 2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserCredits
            {
                Id = Guid.NewGuid(),
                CoachUserId = coachId,
                IncludedRemaining = 0,
                PurchasedRemaining = 2,
                Version = 3,
            });

        var handler = CreateHandler(creditsRepo, pricingRepo, ledgerRepo);
        var result = await handler.Handle(new ConsumeCreditsCommand(coachId, CreditAction.AnalyzeWorkoutMedia, "ref-1"), default);

        Assert.True(result.IsT0);
        Assert.Equal(0, result.AsT0.RemainingIncluded);
        Assert.Equal(2, result.AsT0.RemainingPurchased);

        ledgerRepo.Verify(
            x => x.Append(
                It.Is<CreditLedger>(entry =>
                    entry.CoachUserId == coachId
                    && entry.Action == CreditAction.AnalyzeWorkoutMedia
                    && entry.Type == CreditLedgerType.Deduct
                    && entry.IncludedCreditsChanged == -3
                    && entry.PurchasedCreditsChanged == -2
                    && entry.ReferenceId == "ref-1"),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenOverrideCostIsProvided_UsesOverrideInsteadOfStaticPricing()
    {
        var coachId = Guid.NewGuid();
        var pricingRepo = new Mock<ICreditActionPricingRepository>();
        var creditsRepo = new Mock<IUserCreditsRepository>();
        var ledgerRepo = new Mock<ICreditLedgerRepository>();

        creditsRepo.Setup(r => r.GetByCoachUserId(coachId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserCredits
            {
                Id = Guid.NewGuid(),
                CoachUserId = coachId,
                IncludedRemaining = 1,
                PurchasedRemaining = 4,
                Version = 7,
            });

        creditsRepo.Setup(r => r.AtomicDeduct(coachId, 1, 2, 7, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new UserCredits
            {
                Id = Guid.NewGuid(),
                CoachUserId = coachId,
                IncludedRemaining = 0,
                PurchasedRemaining = 2,
                Version = 8,
            });

        var handler = CreateHandler(creditsRepo, pricingRepo, ledgerRepo);
        var result = await handler.Handle(
            new ConsumeCreditsCommand(
                coachId,
                CreditAction.GenerateWorkoutPlan,
                "proposal-1",
                3),
            default);

        Assert.True(result.IsT0);
        pricingRepo.Verify(
            x => x.GetByAction(It.IsAny<CreditAction>(), It.IsAny<CancellationToken>()),
            Times.Never);
        ledgerRepo.Verify(
            x => x.Append(
                It.Is<CreditLedger>(entry =>
                    entry.Action == CreditAction.GenerateWorkoutPlan
                    && entry.IncludedCreditsChanged == -1
                    && entry.PurchasedCreditsChanged == -2
                    && entry.ReferenceId == "proposal-1"),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
