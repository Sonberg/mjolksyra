using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.UserContext;

public interface IUserContext
{
    public bool IsAuthenticated { get; }

    public string? ClerkSubject { get; }
    
    public Task<User?> GetUser(CancellationToken cancellationToken = default);
    
    public Task<Guid?> GetUserId(CancellationToken cancellationToken = default);

    public Task<bool> IsAdminAsync(CancellationToken cancellationToken = default);
}