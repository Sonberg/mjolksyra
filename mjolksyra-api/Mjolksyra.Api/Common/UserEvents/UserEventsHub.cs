using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.Api.Common.UserEvents;

[Authorize]
public class UserEventsHub(IUserRepository userRepository) : Hub
{
    public const string Path = "/api/events/hub";

    public static string GroupName(Guid userId) => $"user:{userId:N}";

    public override async Task OnConnectedAsync()
    {
        var clerkSubject = Context.User?.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(clerkSubject))
        {
            await base.OnConnectedAsync();
            return;
        }

        var user = await userRepository.GetByClerkId(clerkSubject, Context.ConnectionAborted);
        if (user is not null)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, GroupName(user.Id), Context.ConnectionAborted);
        }

        await base.OnConnectedAsync();
    }
}
