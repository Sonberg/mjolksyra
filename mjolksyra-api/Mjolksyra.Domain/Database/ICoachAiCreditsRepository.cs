using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface ICoachAiCreditsRepository
{
    Task<CoachAiCredits?> GetByCoachUserId(Guid coachUserId, CancellationToken ct);
    Task Create(CoachAiCredits credits, CancellationToken ct);
    /// <summary>
    /// Atomically deducts credits using optimistic concurrency (version filter).
    /// Returns null if the document was modified concurrently (caller should retry).
    /// </summary>
    Task<CoachAiCredits?> AtomicDeduct(Guid coachUserId, int includedToDeduct, int purchasedToDeduct, int expectedVersion, CancellationToken ct);
    Task Upsert(CoachAiCredits credits, CancellationToken ct);
}
