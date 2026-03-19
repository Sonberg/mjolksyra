using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Coaches.AddPurchasedAiCredits;

public class AddPurchasedAiCreditsCommandHandler(
    IAiCreditPackRepository packRepository,
    ICoachAiCreditsRepository creditsRepository,
    IAiCreditLedgerRepository ledgerRepository)
    : IRequestHandler<AddPurchasedAiCreditsCommand>
{
    public async Task Handle(AddPurchasedAiCreditsCommand request, CancellationToken cancellationToken)
    {
        var pack = await packRepository.GetById(request.PackId, cancellationToken);
        if (pack is null) return;

        var existing = await creditsRepository.GetByCoachUserId(request.CoachUserId, cancellationToken);
        var now = DateTimeOffset.UtcNow;

        if (existing is null)
        {
            await creditsRepository.Create(new CoachAiCredits
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

        await ledgerRepository.Append(new AiCreditLedger
        {
            Id = Guid.NewGuid(),
            CoachUserId = request.CoachUserId,
            Type = AiCreditLedgerType.Purchase,
            IncludedCreditsChanged = 0,
            PurchasedCreditsChanged = pack.Credits,
            IdempotencyKey = request.StripeEventId,
            CreatedAt = now,
        }, cancellationToken);
    }
}
