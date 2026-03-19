using MediatR;

namespace Mjolksyra.UseCases.Coaches.GetAiCredits;

public record GetAiCreditsQuery(Guid CoachUserId) : IRequest<GetAiCreditsResponse?>;
