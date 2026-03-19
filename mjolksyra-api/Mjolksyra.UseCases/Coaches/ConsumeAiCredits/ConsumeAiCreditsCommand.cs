using MediatR;
using Mjolksyra.Domain.Database.Enum;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.ConsumeAiCredits;

public record ConsumeAiCreditsCommand(
    Guid CoachUserId,
    AiCreditAction Action,
    string? ReferenceId = null
) : IRequest<OneOf<ConsumeAiCreditsSuccess, ConsumeAiCreditsError>>;
