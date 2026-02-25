using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/notifications")]
public class NotificationsController(
    IUserContext userContext,
    INotificationRepository notificationRepository
) : Controller
{
    [HttpGet]
    public async Task<ActionResult<GetNotificationsResponse>> Get(CancellationToken cancellationToken, [FromQuery] int limit = 20)
    {
        var userId = await userContext.GetUserId(cancellationToken);
        if (userId is null || userId == Guid.Empty)
        {
            return BadRequest();
        }

        var safeLimit = Math.Clamp(limit, 1, 100);
        var items = await notificationRepository.GetByUserId(userId.Value, safeLimit, cancellationToken);
        var unreadCount = await notificationRepository.CountUnreadByUserId(userId.Value, cancellationToken);

        return Ok(new GetNotificationsResponse
        {
            UnreadCount = unreadCount,
            Items = items.Select(x => new NotificationResponse
            {
                Id = x.Id,
                Type = x.Type,
                Title = x.Title,
                Body = x.Body,
                Href = x.Href,
                CreatedAt = x.CreatedAt,
                ReadAt = x.ReadAt
            }).ToList()
        });
    }

    [HttpPost("{notificationId:guid}/read")]
    public async Task<ActionResult> MarkRead(Guid notificationId, CancellationToken cancellationToken)
    {
        var userId = await userContext.GetUserId(cancellationToken);
        if (userId is null || userId == Guid.Empty)
        {
            return BadRequest();
        }

        await notificationRepository.MarkRead(userId.Value, notificationId, cancellationToken);
        return NoContent();
    }

    [HttpPost("read-all")]
    public async Task<ActionResult> MarkAllRead(CancellationToken cancellationToken)
    {
        var userId = await userContext.GetUserId(cancellationToken);
        if (userId is null || userId == Guid.Empty)
        {
            return BadRequest();
        }

        await notificationRepository.MarkAllRead(userId.Value, cancellationToken);
        return NoContent();
    }
}

public class GetNotificationsResponse
{
    public required int UnreadCount { get; set; }

    public required ICollection<NotificationResponse> Items { get; set; }
}

public class NotificationResponse
{
    public required Guid Id { get; set; }

    public required string Type { get; set; }

    public required string Title { get; set; }

    public string? Body { get; set; }

    public string? Href { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? ReadAt { get; set; }
}
