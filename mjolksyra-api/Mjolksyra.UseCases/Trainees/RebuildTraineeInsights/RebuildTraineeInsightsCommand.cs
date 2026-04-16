using MediatR;
using OneOf;

namespace Mjolksyra.UseCases.Trainees.RebuildTraineeInsights;

public record RebuildTraineeInsightsCommand(Guid TraineeId)
    : IRequest<OneOf<RebuildTraineeInsightsSuccess, RebuildTraineeInsightsForbidden, RebuildTraineeInsightsAlreadyPending, RebuildTraineeInsightsInsufficientData, RebuildTraineeInsightsInsufficientCredits>>;

public record RebuildTraineeInsightsSuccess;

public record RebuildTraineeInsightsForbidden;

public record RebuildTraineeInsightsAlreadyPending;

public record RebuildTraineeInsightsInsufficientData(string Reason);

public record RebuildTraineeInsightsInsufficientCredits(string Reason);
