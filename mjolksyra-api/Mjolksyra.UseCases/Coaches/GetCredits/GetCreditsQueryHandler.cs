using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Coaches.GetCredits;

public class GetCreditsQueryHandler(IUserCreditsRepository creditsRepository)
    : IRequestHandler<GetCreditsQuery, GetCreditsResponse?>
{
    public async Task<GetCreditsResponse?> Handle(GetCreditsQuery request, CancellationToken cancellationToken)
    {
        var credits = await creditsRepository.GetByCoachUserId(request.CoachUserId, cancellationToken);
        if (credits is null)
        {
            return null;
        }

        var includedAvailable = credits.IncludedRemaining - credits.IncludedReserved;
        var purchasedAvailable = credits.PurchasedRemaining - credits.PurchasedReserved;

        return new GetCreditsResponse
        {
            IncludedRemaining = includedAvailable,
            PurchasedRemaining = purchasedAvailable,
            TotalRemaining = includedAvailable + purchasedAvailable,
            LastResetAt = credits.LastResetAt,
            NextResetAt = credits.LastResetAt?.AddMonths(1),
        };
    }
}
