using MediatR;

namespace Mjolksyra.UseCases.Coaches.AddPurchasedAiCredits;

public record AddPurchasedAiCreditsCommand(
    Guid CoachUserId,
    Guid PackId,
    string StripeEventId
) : IRequest;
