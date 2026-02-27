using Microsoft.AspNetCore.SignalR;

namespace Mjolksyra.Api.Common.UserEvents;

public class SignalRUserEventPublisher(IHubContext<UserEventsHub> hubContext) : IUserEventPublisher
{
    public async Task Publish(Guid userId, string type, object? payload = null, CancellationToken cancellationToken = default)
    {
        await hubContext.Clients
            .Group(UserEventsHub.GroupName(userId))
            .SendAsync(type, payload ?? new { }, cancellationToken);
    }
}
