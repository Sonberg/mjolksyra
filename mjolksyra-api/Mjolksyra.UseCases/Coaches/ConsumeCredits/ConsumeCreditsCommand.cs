using MediatR;
using Mjolksyra.Domain.Database.Enum;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.ConsumeCredits;

public record ConsumeCreditsCommand(
    Guid CoachUserId,
    CreditAction Action,
    string? ReferenceId = null) : IRequest<OneOf<ConsumeCreditsSuccess, ConsumeCreditsError>>;
