using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.ConsumeAiCredits;

public class ConsumeAiCreditsCommandHandler(
    ICoachAiCreditsRepository creditsRepository,
    IAiCreditActionPricingRepository pricingRepository,
    IAiCreditLedgerRepository ledgerRepository)
    : IRequestHandler<ConsumeAiCreditsCommand, OneOf<ConsumeAiCreditsSuccess, ConsumeAiCreditsError>>
{
    private const int MaxRetries = 3;

    public async Task<OneOf<ConsumeAiCreditsSuccess, ConsumeAiCreditsError>> Handle(
        ConsumeAiCreditsCommand request,
        CancellationToken cancellationToken)
    {
        var pricing = await pricingRepository.GetByAction(request.Action, cancellationToken);
        if (pricing is null)
            return new ConsumeAiCreditsError("Action pricing not configured.");

        var cost = pricing.CreditCost;

        for (var attempt = 0; attempt < MaxRetries; attempt++)
        {
            var credits = await creditsRepository.GetByCoachUserId(request.CoachUserId, cancellationToken);
            if (credits is null)
                return new ConsumeAiCreditsError("Coach has no AI credit balance.");

            var totalAvailable = credits.IncludedRemaining + credits.PurchasedRemaining;
            if (totalAvailable < cost)
                return new ConsumeAiCreditsError("Insufficient credits.");

            var includedUsed = Math.Min(cost, credits.IncludedRemaining);
            var purchasedUsed = cost - includedUsed;

            var updated = await creditsRepository.AtomicDeduct(
                request.CoachUserId,
                includedUsed,
                purchasedUsed,
                credits.Version,
                cancellationToken);

            if (updated is null)
                continue; // concurrent modification — retry

            await ledgerRepository.Append(new AiCreditLedger
            {
                Id = Guid.NewGuid(),
                CoachUserId = request.CoachUserId,
                Action = request.Action,
                Type = AiCreditLedgerType.Deduct,
                IncludedCreditsChanged = -includedUsed,
                PurchasedCreditsChanged = -purchasedUsed,
                ReferenceId = request.ReferenceId,
                CreatedAt = DateTimeOffset.UtcNow,
            }, cancellationToken);

            return new ConsumeAiCreditsSuccess(updated.IncludedRemaining, updated.PurchasedRemaining);
        }

        return new ConsumeAiCreditsError("Could not process request due to concurrent activity. Please retry.");
    }
}
