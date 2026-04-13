using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IUserCreditsRepository
{
    Task<UserCredits?> GetByCoachUserId(Guid coachUserId, CancellationToken ct);

    Task Create(UserCredits credits, CancellationToken ct);

    Task<UserCredits?> AtomicDeduct(
        Guid coachUserId,
        int includedToDeduct,
        int purchasedToDeduct,
        int expectedVersion,
        CancellationToken ct);

    Task<UserCredits?> AtomicReserve(
        Guid coachUserId,
        int includedToReserve,
        int purchasedToReserve,
        int expectedVersion,
        CancellationToken ct);

    Task<UserCredits?> AtomicSettle(
        Guid coachUserId,
        int includedToSettle,
        int purchasedToSettle,
        int expectedVersion,
        CancellationToken ct);

    Task<UserCredits?> AtomicRelease(
        Guid coachUserId,
        int includedToRelease,
        int purchasedToRelease,
        int expectedVersion,
        CancellationToken ct);

    Task Upsert(UserCredits credits, CancellationToken ct);
}
