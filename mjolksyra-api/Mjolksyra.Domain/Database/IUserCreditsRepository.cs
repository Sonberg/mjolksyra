using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IUserCreditsRepository
{
    Task<UserCredits?> GetByCoachUserId(Guid coachUserId, CancellationToken ct);
    Task Create(UserCredits credits, CancellationToken ct);
    /// <summary>
    /// Atomically deducts credits using optimistic concurrency (version filter).
    /// Returns null if the document was modified concurrently (caller should retry).
    /// </summary>
    Task<UserCredits?> AtomicDeduct(Guid coachUserId, int includedToDeduct, int purchasedToDeduct, int expectedVersion, CancellationToken ct);
    Task Upsert(UserCredits credits, CancellationToken ct);
}
