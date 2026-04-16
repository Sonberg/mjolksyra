using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Trainees.GetTraineeInsights;

public class GetTraineeInsightsQueryHandler(
    ITraineeRepository traineeRepository,
    ITraineeInsightsRepository traineeInsightsRepository,
    IUserContext userContext)
    : IRequestHandler<GetTraineeInsightsQuery, TraineeInsightsResponse?>
{
    public async Task<TraineeInsightsResponse?> Handle(GetTraineeInsightsQuery request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null)
        {
            return null;
        }

        var insights = await traineeInsightsRepository.GetByTraineeId(request.TraineeId, cancellationToken);
        if (insights is null)
        {
            return null;
        }

        var isCoach = trainee.CoachUserId == userId;

        // Athletes only see insights when the coach has made them visible
        if (!isCoach && !insights.VisibleToAthlete)
        {
            return null;
        }

        return TraineeInsightsResponse.From(insights);
    }
}
