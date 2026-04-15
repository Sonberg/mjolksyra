using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface ICoachInsightsRepository
{
    Task<CoachInsights?> GetByCoachUserId(Guid coachUserId, CancellationToken ct);

    Task Upsert(CoachInsights insights, CancellationToken ct);
}
