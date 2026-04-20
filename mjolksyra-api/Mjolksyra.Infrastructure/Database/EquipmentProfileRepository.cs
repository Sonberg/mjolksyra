using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class EquipmentProfileRepository(IMongoDbContext context) : IEquipmentProfileRepository
{
    public async Task<EquipmentProfile?> GetByUserId(Guid userId, CancellationToken ct)
    {
        return await context.EquipmentProfiles
            .Find(x => x.UserId == userId)
            .Limit(1)
            .ToListAsync(ct)
            .ContinueWith(t => t.Result.SingleOrDefault(), ct);
    }

    public async Task<EquipmentProfile> Upsert(EquipmentProfile profile, CancellationToken ct)
    {
        var filter = Builders<EquipmentProfile>.Filter.Eq(x => x.UserId, profile.UserId);
        profile.UpdatedAt = DateTimeOffset.UtcNow;

        await context.EquipmentProfiles.ReplaceOneAsync(filter, profile, new ReplaceOptions
        {
            IsUpsert = true
        }, ct);

        return profile;
    }
}
