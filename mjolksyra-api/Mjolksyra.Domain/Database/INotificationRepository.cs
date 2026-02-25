using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface INotificationRepository
{
    Task<Notification> Create(Notification notification, CancellationToken ct);

    Task<ICollection<Notification>> GetByUserId(Guid userId, int limit, CancellationToken ct);

    Task<int> CountUnreadByUserId(Guid userId, CancellationToken ct);

    Task MarkRead(Guid userId, Guid notificationId, CancellationToken ct);

    Task MarkAllRead(Guid userId, CancellationToken ct);
}
