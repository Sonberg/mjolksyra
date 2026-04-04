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

        return new GetCreditsResponse
        {
            IncludedRemaining = credits.IncludedRemaining,
            PurchasedRemaining = credits.PurchasedRemaining,
            TotalRemaining = credits.IncludedRemaining + credits.PurchasedRemaining,
            LastResetAt = credits.LastResetAt,
        };
    }
}
