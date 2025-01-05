using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IRefreshTokenRepository
{
    Task<RefreshToken?> GetByToken(string refreshToken, CancellationToken ct);

    Task<RefreshToken> Create(RefreshToken refreshToken, CancellationToken ct);

    Task<RefreshToken> Update(RefreshToken refreshToken, CancellationToken ct);
}