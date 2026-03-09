using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.Clerk;
using Mjolksyra.UseCases.Users.HandleClerkUserCreated;
using Mjolksyra.UseCases.Users.HandleClerkUserDeleted;
using Mjolksyra.UseCases.Users.HandleClerkUserUpdated;
using Svix;
using Svix.Exceptions;

namespace Mjolksyra.Api.Controllers.Clerk;

[ApiController]
[Route("api/clerk/webhook")]
public class ClerkWebhookController : Controller
{
    private readonly ClerkOptions _options;
    private readonly IMediator _mediator;
    private readonly ILogger<ClerkWebhookController> _logger;

    public ClerkWebhookController(
        IOptions<ClerkOptions> options,
        IMediator mediator,
        ILogger<ClerkWebhookController> logger)
    {
        _options = options.Value;
        _mediator = mediator;
        _logger = logger;
    }

    [HttpPost]
    public async Task<ActionResult> Handle()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

        try
        {
            var wh = new Webhook(_options.WebhookSecret!);
            var headers = new System.Net.WebHeaderCollection();
            foreach (var key in new[] { "svix-id", "svix-timestamp", "svix-signature" })
            {
                var value = Request.Headers[key].FirstOrDefault();
                if (value is not null) headers.Add(key, value);
            }
            wh.Verify(json, headers);
        }
        catch (WebhookVerificationException ex)
        {
            _logger.LogWarning(ex, "Rejected Clerk webhook due to invalid signature.");
            return BadRequest();
        }

        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        var type = root.GetProperty("type").GetString();
        var data = root.GetProperty("data");

        switch (type)
        {
            case "user.created":
                await _mediator.Send(new HandleClerkUserCreatedCommand
                {
                    ClerkUserId = data.GetProperty("id").GetString()!,
                    Email = ExtractPrimaryEmail(data),
                    GivenName = data.TryGetProperty("first_name", out var fn) ? fn.GetString() : null,
                    FamilyName = data.TryGetProperty("last_name", out var ln) ? ln.GetString() : null,
                });
                break;

            case "user.updated":
                await _mediator.Send(new HandleClerkUserUpdatedCommand
                {
                    ClerkUserId = data.GetProperty("id").GetString()!,
                    Email = ExtractPrimaryEmail(data),
                    GivenName = data.TryGetProperty("first_name", out var ufn) ? ufn.GetString() : null,
                    FamilyName = data.TryGetProperty("last_name", out var uln) ? uln.GetString() : null,
                });
                break;

            case "user.deleted":
                await _mediator.Send(new HandleClerkUserDeletedCommand
                {
                    ClerkUserId = data.GetProperty("id").GetString()!,
                });
                break;

            default:
                _logger.LogInformation("Unhandled Clerk webhook event type: {EventType}", type);
                break;
        }

        return Ok();
    }

    private static string ExtractPrimaryEmail(JsonElement data)
    {
        var primaryId = data.GetProperty("primary_email_address_id").GetString();
        foreach (var entry in data.GetProperty("email_addresses").EnumerateArray())
        {
            if (entry.GetProperty("id").GetString() == primaryId)
            {
                return entry.GetProperty("email_address").GetString()!;
            }
        }

        return string.Empty;
    }
}
