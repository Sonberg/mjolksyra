using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Coaches.ConsumeAiCredits;

namespace Mjolksyra.UseCases.Tests.Coaches;

public class ConsumeAiCreditsCommandHandlerTests
{
    private static ConsumeAiCreditsCommandHandler CreateHandler(
        Mock<ICoachAiCreditsRepository> creditsRepo,
        Mock<IAiCreditActionPricingRepository> pricingRepo,
        Mock<IAiCreditLedgerRepository> ledgerRepo)
        => new(creditsRepo.Object, pricingRepo.Object, ledgerRepo.Object);

    private static AiCreditActionPricing BuildPricing(int cost) => new()
    {
        Id = Guid.NewGuid(),
        Action = AiCreditAction.PlanWorkout,
        CreditCost = cost,
    };

    private static CoachAiCredits BuildCredits(Guid coachId, int included, int purchased, int version = 0) => new()
    {
        Id = Guid.NewGuid(),
        CoachUserId = coachId,
        IncludedRemaining = included,
        PurchasedRemaining = purchased,
        Version = version,
    };

    [Fact]
    public async Task Handle_InsufficientCredits_ReturnsError_NoAtomicDeduct()
    {
        var coachId = Guid.NewGuid();
        var pricingRepo = new Mock<IAiCreditActionPricingRepository>();
        var creditsRepo = new Mock<ICoachAiCreditsRepository>();
        var ledgerRepo = new Mock<IAiCreditLedgerRepository>();

        pricingRepo.Setup(r => r.GetByAction(AiCreditAction.PlanWorkout, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildPricing(10));
        creditsRepo.Setup(r => r.GetByCoachUserId(coachId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildCredits(coachId, included: 3, purchased: 2));

        var handler = CreateHandler(creditsRepo, pricingRepo, ledgerRepo);
        var result = await handler.Handle(new ConsumeAiCreditsCommand(coachId, AiCreditAction.PlanWorkout), default);

        Assert.True(result.IsT1);
        Assert.Contains("Insufficient", result.AsT1.Reason);
        creditsRepo.Verify(r => r.AtomicDeduct(It.IsAny<Guid>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<int>(), It.IsAny<CancellationToken>()), Times.Never);
        ledgerRepo.Verify(r => r.Append(It.IsAny<AiCreditLedger>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_CoveredByIncludedOnly_DeductsFromIncluded()
    {
        var coachId = Guid.NewGuid();
        var pricingRepo = new Mock<IAiCreditActionPricingRepository>();
        var creditsRepo = new Mock<ICoachAiCreditsRepository>();
        var ledgerRepo = new Mock<IAiCreditLedgerRepository>();

        pricingRepo.Setup(r => r.GetByAction(AiCreditAction.PlanWorkout, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildPricing(1));

        var credits = BuildCredits(coachId, included: 10, purchased: 5, version: 2);
        creditsRepo.Setup(r => r.GetByCoachUserId(coachId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(credits);
        creditsRepo.Setup(r => r.AtomicDeduct(coachId, 1, 0, 2, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildCredits(coachId, included: 9, purchased: 5, version: 3));

        var handler = CreateHandler(creditsRepo, pricingRepo, ledgerRepo);
        var result = await handler.Handle(new ConsumeAiCreditsCommand(coachId, AiCreditAction.PlanWorkout), default);

        Assert.True(result.IsT0);
        Assert.Equal(9, result.AsT0.RemainingIncluded);
        Assert.Equal(5, result.AsT0.RemainingPurchased);
        creditsRepo.Verify(r => r.AtomicDeduct(coachId, 1, 0, 2, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_SpillsIntoPurchased_DeductsSplit()
    {
        var coachId = Guid.NewGuid();
        var pricingRepo = new Mock<IAiCreditActionPricingRepository>();
        var creditsRepo = new Mock<ICoachAiCreditsRepository>();
        var ledgerRepo = new Mock<IAiCreditLedgerRepository>();

        pricingRepo.Setup(r => r.GetByAction(AiCreditAction.GenerateBlock, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AiCreditActionPricing { Id = Guid.NewGuid(), Action = AiCreditAction.GenerateBlock, CreditCost = 5 });

        var credits = BuildCredits(coachId, included: 3, purchased: 10, version: 1);
        creditsRepo.Setup(r => r.GetByCoachUserId(coachId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(credits);
        creditsRepo.Setup(r => r.AtomicDeduct(coachId, 3, 2, 1, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildCredits(coachId, included: 0, purchased: 8, version: 2));

        var handler = CreateHandler(creditsRepo, pricingRepo, ledgerRepo);
        var result = await handler.Handle(new ConsumeAiCreditsCommand(coachId, AiCreditAction.GenerateBlock), default);

        Assert.True(result.IsT0);
        Assert.Equal(0, result.AsT0.RemainingIncluded);
        Assert.Equal(8, result.AsT0.RemainingPurchased);
        creditsRepo.Verify(r => r.AtomicDeduct(coachId, 3, 2, 1, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_CoachNotFound_ReturnsError()
    {
        var coachId = Guid.NewGuid();
        var pricingRepo = new Mock<IAiCreditActionPricingRepository>();
        var creditsRepo = new Mock<ICoachAiCreditsRepository>();
        var ledgerRepo = new Mock<IAiCreditLedgerRepository>();

        pricingRepo.Setup(r => r.GetByAction(AiCreditAction.PlanWorkout, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildPricing(1));
        creditsRepo.Setup(r => r.GetByCoachUserId(coachId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((CoachAiCredits?)null);

        var handler = CreateHandler(creditsRepo, pricingRepo, ledgerRepo);
        var result = await handler.Handle(new ConsumeAiCreditsCommand(coachId, AiCreditAction.PlanWorkout), default);

        Assert.True(result.IsT1);
    }

    [Fact]
    public async Task Handle_OptimisticConcurrencyRetry_SucceedsOnSecondAttempt()
    {
        var coachId = Guid.NewGuid();
        var pricingRepo = new Mock<IAiCreditActionPricingRepository>();
        var creditsRepo = new Mock<ICoachAiCreditsRepository>();
        var ledgerRepo = new Mock<IAiCreditLedgerRepository>();

        pricingRepo.Setup(r => r.GetByAction(AiCreditAction.PlanWorkout, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildPricing(1));

        var credits = BuildCredits(coachId, included: 5, purchased: 0, version: 0);
        creditsRepo.Setup(r => r.GetByCoachUserId(coachId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(credits);

        var callCount = 0;
        creditsRepo.Setup(r => r.AtomicDeduct(coachId, 1, 0, 0, It.IsAny<CancellationToken>()))
            .ReturnsAsync(() =>
            {
                callCount++;
                // First attempt: concurrent modification (return null), second: success
                return callCount == 1
                    ? null
                    : BuildCredits(coachId, included: 4, purchased: 0, version: 1);
            });

        var handler = CreateHandler(creditsRepo, pricingRepo, ledgerRepo);
        var result = await handler.Handle(new ConsumeAiCreditsCommand(coachId, AiCreditAction.PlanWorkout), default);

        Assert.True(result.IsT0);
        Assert.Equal(4, result.AsT0.RemainingIncluded);
        creditsRepo.Verify(r => r.AtomicDeduct(coachId, 1, 0, 0, It.IsAny<CancellationToken>()), Times.Exactly(2));
    }

    [Fact]
    public async Task Handle_Success_WritesLedgerEntryWithCorrectValues()
    {
        var coachId = Guid.NewGuid();
        var referenceId = "workout_abc";
        var pricingRepo = new Mock<IAiCreditActionPricingRepository>();
        var creditsRepo = new Mock<ICoachAiCreditsRepository>();
        var ledgerRepo = new Mock<IAiCreditLedgerRepository>();

        pricingRepo.Setup(r => r.GetByAction(AiCreditAction.AnalyzeWorkoutText, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AiCreditActionPricing { Id = Guid.NewGuid(), Action = AiCreditAction.AnalyzeWorkoutText, CreditCost = 1 });

        var credits = BuildCredits(coachId, included: 0, purchased: 5, version: 7);
        creditsRepo.Setup(r => r.GetByCoachUserId(coachId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(credits);
        creditsRepo.Setup(r => r.AtomicDeduct(coachId, 0, 1, 7, It.IsAny<CancellationToken>()))
            .ReturnsAsync(BuildCredits(coachId, included: 0, purchased: 4, version: 8));

        AiCreditLedger? capturedEntry = null;
        ledgerRepo.Setup(r => r.Append(It.IsAny<AiCreditLedger>(), It.IsAny<CancellationToken>()))
            .Callback<AiCreditLedger, CancellationToken>((e, _) => capturedEntry = e)
            .Returns(Task.CompletedTask);

        var handler = CreateHandler(creditsRepo, pricingRepo, ledgerRepo);
        await handler.Handle(new ConsumeAiCreditsCommand(coachId, AiCreditAction.AnalyzeWorkoutText, referenceId), default);

        Assert.NotNull(capturedEntry);
        Assert.Equal(coachId, capturedEntry!.CoachUserId);
        Assert.Equal(AiCreditAction.AnalyzeWorkoutText, capturedEntry.Action);
        Assert.Equal(AiCreditLedgerType.Deduct, capturedEntry.Type);
        Assert.Equal(0, capturedEntry.IncludedCreditsChanged);
        Assert.Equal(-1, capturedEntry.PurchasedCreditsChanged);
        Assert.Equal(referenceId, capturedEntry.ReferenceId);
    }
}
