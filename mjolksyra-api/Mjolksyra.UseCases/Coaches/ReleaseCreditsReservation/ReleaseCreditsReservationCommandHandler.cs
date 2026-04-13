using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Coaches.ReleaseCreditsReservation;

public class ReleaseCreditsReservationCommandHandler(
    IUserCreditsRepository creditsRepository,
    ICreditLedgerRepository ledgerRepository)
    : IRequestHandler<ReleaseCreditsReservationCommand, ReleaseCreditsReservationResult>
{
    private const int MaxRetries = 3;

    public async Task<ReleaseCreditsReservationResult> Handle(
        ReleaseCreditsReservationCommand request,
        CancellationToken cancellationToken)
    {
        for (var attempt = 0; attempt < MaxRetries; attempt++)
        {
            var credits = await creditsRepository.GetByCoachUserId(request.CoachUserId, cancellationToken);
            if (credits is null)
            {
                return new ReleaseCreditsReservationResult(false);
            }

            var updated = await creditsRepository.AtomicRelease(
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
                Action = null,
                Type = CreditLedgerType.Release,
                IncludedCreditsChanged = request.IncludedAmount,
                PurchasedCreditsChanged = request.PurchasedAmount,
                ReferenceId = request.ReferenceId,
                CreatedAt = DateTimeOffset.UtcNow,
            }, cancellationToken);

            return new ReleaseCreditsReservationResult(true);
        }

        return new ReleaseCreditsReservationResult(false);
    }
}
