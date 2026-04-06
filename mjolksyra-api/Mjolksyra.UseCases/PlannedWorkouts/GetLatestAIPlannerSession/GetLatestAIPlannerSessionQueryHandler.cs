using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetLatestAIPlannerSession;

public class GetLatestAIPlannerSessionQueryHandler(
    IAIPlannerSessionRepository sessionRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<GetLatestAIPlannerSessionQuery, GetLatestAIPlannerSessionResponse?>
{
    public async Task<GetLatestAIPlannerSessionResponse?> Handle(
        GetLatestAIPlannerSessionQuery request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return null;
        }

        var session = await sessionRepository.GetLatestByTrainee(request.TraineeId, userId, cancellationToken);
        if (session is null)
        {
            return null;
        }

        return new GetLatestAIPlannerSessionResponse
        {
            SessionId = session.Id,
            Description = session.Description,
            ConversationHistory = session.ConversationHistory,
            SuggestedParams = session.SuggestedParams,
            GenerationResult = session.GenerationResult,
        };
    }
}
