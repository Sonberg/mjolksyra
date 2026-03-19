using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.ConsumeCredits;

public class ConsumeCreditsCommandHandler(
    IUserCreditsRepository creditsRepository,
    ICreditActionPricingRepository pricingRepository,
    ICreditLedgerRepository ledgerRepository)
    : IRequestHandler<ConsumeCreditsCommand, OneOf<ConsumeCreditsSuccess, ConsumeCreditsError>>
{
    private const int MaxRetries = 3;

    public async Task<OneOf<ConsumeCreditsSuccess, ConsumeCreditsError>> Handle(
        ConsumeCreditsCommand request,
        CancellationToken cancellationToken)
    {
        var pricing = await pricingRepository.GetByAction(request.Action, cancellationToken);
        if (pricing is null)
            return new ConsumeCreditsError("Action pricing not configured.");

        var cost = pricing.CreditCost;

        for (var attempt = 0; attempt < MaxRetries; attempt++)
        {
            var credits = await creditsRepository.GetByCoachUserId(request.CoachUserId, cancellationToken);
            if (credits is null)
                return new ConsumeCreditsError("Coach has no AI credit balance.");

            var totalAvailable = credits.IncludedRemaining + credits.PurchasedRemaining;
            if (totalAvailable < cost)
                return new ConsumeCreditsError("Insufficient credits.");

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

            await ledgerRepository.Append(new CreditLedger
            {
                Id = Guid.NewGuid(),
                CoachUserId = request.CoachUserId,
                Action = request.Action,
                Type = CreditLedgerType.Deduct,
                IncludedCreditsChanged = -includedUsed,
                PurchasedCreditsChanged = -purchasedUsed,
                ReferenceId = request.ReferenceId,
                CreatedAt = DateTimeOffset.UtcNow,
            }, cancellationToken);

            return new ConsumeCreditsSuccess(updated.IncludedRemaining, updated.PurchasedRemaining);
        }

        return new ConsumeCreditsError("Could not process request due to concurrent activity. Please retry.");
    }
}
