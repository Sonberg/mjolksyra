using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Admin.GrantCoachCredits;

public class GrantCoachCreditsCommandHandler(
    IUserCreditsRepository creditsRepository,
    ICreditLedgerRepository ledgerRepository)
    : IRequestHandler<GrantCoachCreditsCommand>
{
    public async Task Handle(GrantCoachCreditsCommand request, CancellationToken cancellationToken)
    {
        var amount = Math.Max(0, request.PurchasedCredits);
        if (amount == 0)
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
                PurchasedRemaining = amount,
                LastResetAt = null,
                Version = 0,
            }, cancellationToken);
        }
        else
        {
            existing.PurchasedRemaining += amount;
            existing.Version++;
            await creditsRepository.Upsert(existing, cancellationToken);
        }

        await ledgerRepository.Append(new CreditLedger
        {
            Id = Guid.NewGuid(),
            CoachUserId = request.CoachUserId,
            Type = CreditLedgerType.AdminGrant,
            IncludedCreditsChanged = 0,
            PurchasedCreditsChanged = amount,
            ReferenceId = request.Reason,
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);
    }
}
