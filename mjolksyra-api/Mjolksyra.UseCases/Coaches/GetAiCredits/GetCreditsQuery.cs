using MediatR;

namespace Mjolksyra.UseCases.Coaches.GetCredits;

public record GetCreditsQuery(Guid CoachUserId) : IRequest<GetCreditsResponse?>;
