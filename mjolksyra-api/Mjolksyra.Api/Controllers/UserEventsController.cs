using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Api.Common.UserEvents;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/events")]
public class UserEventsController : ControllerBase
{
    private readonly IUserContext _userContext;
    private readonly UserEventStream _userEventStream;

    public UserEventsController(IUserContext userContext, UserEventStream userEventStream)
    {
        _userContext = userContext;
        _userEventStream = userEventStream;
    }

    [HttpGet("stream")]
    public async Task Stream(CancellationToken cancellationToken)
    {
        if (await _userContext.GetUserId(cancellationToken) is not { } userId)
        {
            Response.StatusCode = StatusCodes.Status401Unauthorized;
            return;
        }

        Response.Headers.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";
        Response.Headers.Append("X-Accel-Buffering", "no");

        var (subscriptionId, reader) = _userEventStream.Subscribe(userId);

        try
        {
            await Response.WriteAsync(": connected\n\n", cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);

            while (!cancellationToken.IsCancellationRequested)
            {
                var readTask = reader.ReadAsync(cancellationToken).AsTask();
                var tickTask = Task.Delay(TimeSpan.FromSeconds(20), cancellationToken);

                var completed = await Task.WhenAny(readTask, tickTask);
                if (completed == tickTask)
                {
                    await Response.WriteAsync(": ping\n\n", cancellationToken);
                    await Response.Body.FlushAsync(cancellationToken);
                    continue;
                }

                var message = await readTask;
                await Response.WriteAsync($"event: {message.Type}\n", cancellationToken);
                await Response.WriteAsync($"data: {message.Data}\n\n", cancellationToken);
                await Response.Body.FlushAsync(cancellationToken);
            }
        }
        catch (OperationCanceledException)
        {
            // client disconnected
        }
        finally
        {
            _userEventStream.Unsubscribe(userId, subscriptionId);
        }
    }
}
