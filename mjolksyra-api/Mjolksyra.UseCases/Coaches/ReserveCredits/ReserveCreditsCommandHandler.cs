using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.ReserveCredits;

public class ReserveCreditsCommandHandler(
    IUserCreditsRepository creditsRepository,
    ICreditActionPricingRepository pricingRepository,
    ICreditLedgerRepository ledgerRepository)
    : IRequestHandler<ReserveCreditsCommand, OneOf<ReserveCreditsSuccess, ReserveCreditsError>>
{
    private const int MaxRetries = 3;

    public async Task<OneOf<ReserveCreditsSuccess, ReserveCreditsError>> Handle(
        ReserveCreditsCommand request,
        CancellationToken cancellationToken)
    {
        var cost = request.CreditCostOverride;
        if (!cost.HasValue)
        {
            var pricing = await pricingRepository.GetByAction(request.Action, cancellationToken);
            if (pricing is null)
            {
                return new ReserveCreditsError("Action pricing not configured.");
            }

            cost = pricing.CreditCost;
        }

        for (var attempt = 0; attempt < MaxRetries; attempt++)
        {
            var credits = await creditsRepository.GetByCoachUserId(request.CoachUserId, cancellationToken);
            if (credits is null)
            {
                return new ReserveCreditsError("Insufficient credits.");
            }

            var includedAvailable = credits.IncludedRemaining - credits.IncludedReserved;
            var purchasedAvailable = credits.PurchasedRemaining - credits.PurchasedReserved;
            var totalAvailable = includedAvailable + purchasedAvailable;

            if (totalAvailable < cost.Value)
            {
                return new ReserveCreditsError("Insufficient credits.");
            }

            var includedToReserve = Math.Min(cost.Value, includedAvailable);
            var purchasedToReserve = cost.Value - includedToReserve;

            var updated = await creditsRepository.AtomicReserve(
                request.CoachUserId,
                includedToReserve,
                purchasedToReserve,
                credits.Version,
                cancellationToken);

            if (updated is null)
            {
                continue;
            }

            await ledgerRepository.Append(new CreditLedger
            {
                Id = Guid.NewGuid(),
                CoachUserId = request.CoachUserId,
                Action = request.Action,
                Type = CreditLedgerType.Reserve,
                IncludedCreditsChanged = -includedToReserve,
                PurchasedCreditsChanged = -purchasedToReserve,
                ReferenceId = request.ReferenceId,
                CreatedAt = DateTimeOffset.UtcNow,
            }, cancellationToken);

            return new ReserveCreditsSuccess(includedToReserve, purchasedToReserve, cost.Value);
        }

        return new ReserveCreditsError("Could not process request due to concurrent activity. Please retry.");
    }
}
