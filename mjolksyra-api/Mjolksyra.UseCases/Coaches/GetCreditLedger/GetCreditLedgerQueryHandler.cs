using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Coaches.GetCreditLedger;

public class GetCreditLedgerQueryHandler(ICreditLedgerRepository creditLedgerRepository)
    : IRequestHandler<GetCreditLedgerQuery, ICollection<CreditLedgerItemResponse>>
{
    public async Task<ICollection<CreditLedgerItemResponse>> Handle(GetCreditLedgerQuery request, CancellationToken cancellationToken)
    {
        var limit = Math.Clamp(request.Limit, 1, 200);
        var entries = await creditLedgerRepository.GetByCoachUserId(
            request.CoachUserId,
            limit,
            request.Before,
            cancellationToken);

        return entries.Select(x => new CreditLedgerItemResponse
        {
            Id = x.Id,
            Type = x.Type,
            Action = x.Action,
            IncludedCreditsChanged = x.IncludedCreditsChanged,
            PurchasedCreditsChanged = x.PurchasedCreditsChanged,
            ReferenceId = x.ReferenceId,
            CreatedAt = x.CreatedAt,
        }).ToList();
    }
}
