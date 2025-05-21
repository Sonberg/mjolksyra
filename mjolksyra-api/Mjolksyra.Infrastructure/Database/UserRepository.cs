using Mjolksyra.Domain;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class UserRepository : IUserRepository
{
    private readonly IMongoDbContext _context;

    public UserRepository(IMongoDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmail(string email, CancellationToken ct)
    {
        return await _context.Users
            .Find(
                Builders<User>.Filter.Or(
                    Builders<User>.Filter.Eq(x => x.Email.Value, email),
                    Builders<User>.Filter.Eq(x => x.Email.Normalized, EmailNormalizer.Normalize(email)
                    )
                )
            )
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task<User> GetById(Guid id, CancellationToken ct)
    {
        return await _context.Users
            .Find(x => x.Id == id)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.Single(), ct);
    }

    public async Task<ICollection<User>> GetManyById(ICollection<Guid> ids, CancellationToken ct)
    {
        return await _context.Users
            .Find(x => ids.Contains(x.Id))
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.ToList(), ct);
    }

    public async Task<User> Create(User user, CancellationToken ct)
    {
        await _context.Users.InsertOneAsync(user, new InsertOneOptions(), ct);

        return user;
    }

    public async Task<User> Update(User user, CancellationToken ct)
    {
        await _context.Users.ReplaceOneAsync(x => x.Id == user.Id, user, new ReplaceOptions
        {
            IsUpsert = false
        }, ct);

        return user;
    }
}