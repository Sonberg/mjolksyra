using MediatR;
using Mjolksyra.Domain.Database.Enum;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.ReserveCredits;

public record ReserveCreditsCommand(
    Guid CoachUserId,
    CreditAction Action,
    string? ReferenceId = null,
    int? CreditCostOverride = null) : IRequest<OneOf<ReserveCreditsSuccess, ReserveCreditsError>>;
