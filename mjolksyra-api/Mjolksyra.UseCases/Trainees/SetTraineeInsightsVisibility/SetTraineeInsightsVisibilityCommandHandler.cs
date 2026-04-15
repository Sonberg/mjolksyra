using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Trainees.SetTraineeInsightsVisibility;

public class SetTraineeInsightsVisibilityCommandHandler(
    ITraineeRepository traineeRepository,
    ITraineeInsightsRepository traineeInsightsRepository,
    IUserContext userContext)
    : IRequestHandler<SetTraineeInsightsVisibilityCommand, bool>
{
    public async Task<bool> Handle(SetTraineeInsightsVisibilityCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return false;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return false;
        }

        var existing = await traineeInsightsRepository.GetByTraineeId(request.TraineeId, cancellationToken);
        var document = existing ?? new TraineeInsights
        {
            Id = request.TraineeId,
            CreatedAt = DateTimeOffset.UtcNow,
            Status = InsightsStatus.Pending,
        };

        document.VisibleToAthlete = request.VisibleToAthlete;
        await traineeInsightsRepository.Upsert(document, cancellationToken);

        return true;
    }
}
