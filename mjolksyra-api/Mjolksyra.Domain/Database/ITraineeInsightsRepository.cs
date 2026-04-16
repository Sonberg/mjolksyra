using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface ITraineeInsightsRepository
{
    Task<TraineeInsights?> GetByTraineeId(Guid traineeId, CancellationToken ct);

    Task Upsert(TraineeInsights insights, CancellationToken ct);
}
