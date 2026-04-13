using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Coaches.SettleCreditsReservation;

public class SettleCreditsReservationCommandHandler(
    IUserCreditsRepository creditsRepository,
    ICreditLedgerRepository ledgerRepository)
    : IRequestHandler<SettleCreditsReservationCommand, SettleCreditsReservationResult>
{
    private const int MaxRetries = 3;

    public async Task<SettleCreditsReservationResult> Handle(
        SettleCreditsReservationCommand request,
        CancellationToken cancellationToken)
    {
        for (var attempt = 0; attempt < MaxRetries; attempt++)
        {
            var credits = await creditsRepository.GetByCoachUserId(request.CoachUserId, cancellationToken);
            if (credits is null)
            {
                return new SettleCreditsReservationResult(false);
            }

            var updated = await creditsRepository.AtomicSettle(
                request.CoachUserId,
                request.IncludedAmount,
                request.PurchasedAmount,
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
                Type = CreditLedgerType.Deduct,
                IncludedCreditsChanged = -request.IncludedAmount,
                PurchasedCreditsChanged = -request.PurchasedAmount,
                ReferenceId = request.ReferenceId,
                CreatedAt = DateTimeOffset.UtcNow,
            }, cancellationToken);

            return new SettleCreditsReservationResult(true);
        }

        return new SettleCreditsReservationResult(false);
    }
}
