using MediatR;

namespace Mjolksyra.UseCases.Admin.GrantCoachCredits;

public record GrantCoachCreditsCommand(Guid CoachUserId, int PurchasedCredits, string? Reason) : IRequest;
