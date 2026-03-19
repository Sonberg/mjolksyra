using MediatR;

namespace Mjolksyra.UseCases.Coaches.ResetUserCredits;

public record ResetUserCreditsCommand(Guid CoachUserId) : IRequest;
