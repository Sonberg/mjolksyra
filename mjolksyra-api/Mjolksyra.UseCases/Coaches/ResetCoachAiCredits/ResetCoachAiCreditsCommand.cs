using MediatR;

namespace Mjolksyra.UseCases.Coaches.ResetCoachAiCredits;

public record ResetCoachAiCreditsCommand(Guid CoachUserId) : IRequest;
