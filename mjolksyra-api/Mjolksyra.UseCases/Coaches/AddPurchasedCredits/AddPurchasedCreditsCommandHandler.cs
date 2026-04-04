using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Coaches.AddPurchasedCredits;

public class AddPurchasedCreditsCommandHandler(
    ICreditPackRepository packRepository,
    IUserCreditsRepository creditsRepository,
    ICreditLedgerRepository ledgerRepository)
    : IRequestHandler<AddPurchasedCreditsCommand>
{
    public async Task Handle(AddPurchasedCreditsCommand request, CancellationToken cancellationToken)
    {
        var pack = await packRepository.GetById(request.PackId, cancellationToken);
        if (pack is null || !pack.IsActive)
        {
            return;
        }

        var existing = await creditsRepository.GetByCoachUserId(request.CoachUserId, cancellationToken);

        if (existing is null)
        {
            await creditsRepository.Create(new UserCredits
            {
                Id = Guid.NewGuid(),
                CoachUserId = request.CoachUserId,
                IncludedRemaining = 0,
                PurchasedRemaining = pack.Credits,
                LastResetAt = null,
                Version = 0,
            }, cancellationToken);
        }
        else
        {
            existing.PurchasedRemaining += pack.Credits;
            existing.Version++;
            await creditsRepository.Upsert(existing, cancellationToken);
        }

        await ledgerRepository.Append(new CreditLedger
        {
            Id = Guid.NewGuid(),
            CoachUserId = request.CoachUserId,
            Type = CreditLedgerType.Purchase,
            IncludedCreditsChanged = 0,
            PurchasedCreditsChanged = pack.Credits,
            IdempotencyKey = request.StripeEventId,
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);
    }
}
