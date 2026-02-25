using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class NotificationRepository(IMongoDbContext context) : INotificationRepository
{
    public async Task<Notification> Create(Notification notification, CancellationToken ct)
    {
        await context.Notifications.InsertOneAsync(notification, cancellationToken: ct);
        return notification;
    }

    public async Task<ICollection<Notification>> GetByUserId(Guid userId, int limit, CancellationToken ct)
    {
        return await context.Notifications
            .Find(x => x.UserId == userId)
            .SortByDescending(x => x.CreatedAt)
            .Limit(limit)
            .ToListAsync(ct)
            .ContinueWith(t => (ICollection<Notification>)t.Result, ct);
    }

    public async Task<int> CountUnreadByUserId(Guid userId, CancellationToken ct)
    {
        return (int)await context.Notifications.CountDocumentsAsync(
            x => x.UserId == userId && x.ReadAt == null,
            cancellationToken: ct);
    }

    public async Task MarkRead(Guid userId, Guid notificationId, CancellationToken ct)
    {
        await context.Notifications.UpdateOneAsync(
            x => x.Id == notificationId && x.UserId == userId && x.ReadAt == null,
            Builders<Notification>.Update.Set(x => x.ReadAt, DateTimeOffset.UtcNow),
            cancellationToken: ct);
    }

    public async Task MarkAllRead(Guid userId, CancellationToken ct)
    {
        await context.Notifications.UpdateManyAsync(
            x => x.UserId == userId && x.ReadAt == null,
            Builders<Notification>.Update.Set(x => x.ReadAt, DateTimeOffset.UtcNow),
            cancellationToken: ct);
    }
}
