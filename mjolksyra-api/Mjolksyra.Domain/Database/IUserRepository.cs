using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IUserRepository
{
    Task<User?> GetByEmail(string email, CancellationToken ct);
    
    Task<User> GetById(Guid id, CancellationToken ct);

    Task<User> Create(User user, CancellationToken ct);

    Task<User> Update(User user, CancellationToken ct);
}