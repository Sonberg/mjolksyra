using MediatR;

namespace Mjolksyra.UseCases.Coaches.AddPurchasedCredits;

public record AddPurchasedCreditsCommand(Guid CoachUserId, Guid PackId, string StripeEventId) : IRequest;
