using MediatR;

namespace Mjolksyra.UseCases.Coaches.GetCreditLedger;

public record GetCreditLedgerQuery(
    Guid CoachUserId,
    int Limit,
    DateTimeOffset? Before) : IRequest<ICollection<CreditLedgerItemResponse>>;
