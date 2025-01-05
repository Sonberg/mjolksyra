using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class RefreshTokenRepository : IRefreshTokenRepository
{
    private readonly IMongoDbContext _context;

    public RefreshTokenRepository(IMongoDbContext context)
    {
        _context = context;
    }

    public Task<RefreshToken?> GetByToken(string refreshToken, CancellationToken ct)
    {
        return _context.RefreshTokens.Find(x => x.Token == refreshToken)
            .ToListAsync(cancellationToken: ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task<RefreshToken> Create(RefreshToken refreshToken, CancellationToken ct)
    {
        await _context.RefreshTokens.InsertOneAsync(refreshToken, new InsertOneOptions(), ct);

        return refreshToken;
    }

    public async Task<RefreshToken> Update(RefreshToken refreshToken, CancellationToken ct)
    {
        await _context.RefreshTokens.ReplaceOneAsync(x => x.Id == refreshToken.Id, refreshToken, new ReplaceOptions
        {
            IsUpsert = false
        }, ct);

        return refreshToken;
    }
}