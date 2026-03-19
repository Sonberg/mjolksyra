using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Coaches.GetAiCredits;

public class GetAiCreditsQueryHandler(ICoachAiCreditsRepository creditsRepository)
    : IRequestHandler<GetAiCreditsQuery, GetAiCreditsResponse?>
{
    public async Task<GetAiCreditsResponse?> Handle(GetAiCreditsQuery request, CancellationToken cancellationToken)
    {
        var credits = await creditsRepository.GetByCoachUserId(request.CoachUserId, cancellationToken);
        if (credits is null) return null;

        return new GetAiCreditsResponse
        {
            IncludedRemaining = credits.IncludedRemaining,
            PurchasedRemaining = credits.PurchasedRemaining,
            TotalRemaining = credits.IncludedRemaining + credits.PurchasedRemaining,
            LastResetAt = credits.LastResetAt,
        };
    }
}
