using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IUserRepository
{
    Task<User?> GetByEmail(string email, CancellationToken ct);

    Task<User?> GetByClerkId(string clerkUserId, CancellationToken ct);

    Task<User> GetById(Guid id, CancellationToken ct);

    Task<ICollection<User>> GetManyById(ICollection<Guid> ids, CancellationToken ct);

    Task<User> Create(User user, CancellationToken ct);

    Task<User> Update(User user, CancellationToken ct);

    Task<long> CountAsync(CancellationToken ct);

    Task<long> CountCoachesAsync(CancellationToken ct);

    Task<long> CountAthletesAsync(CancellationToken ct);
}