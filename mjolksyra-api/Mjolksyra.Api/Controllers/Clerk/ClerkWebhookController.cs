using System.Text.Json;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.Clerk;
using Mjolksyra.Domain.Email;
using Mjolksyra.UseCases.Users.HandleClerkUserCreated;
using Mjolksyra.UseCases.Users.HandleClerkUserDeleted;
using Mjolksyra.UseCases.Users.HandleClerkUserUpdated;
using Svix;
using Svix.Exceptions;

namespace Mjolksyra.Api.Controllers.Clerk;

[ApiController]
[Route("api/clerk/webhook")]
[Route("clerk/webhook")]
public class ClerkWebhookController : Controller
{
    private readonly ClerkOptions _options;
    private readonly IMediator _mediator;
    private readonly IEmailSender _emailSender;
    private readonly ILogger<ClerkWebhookController> _logger;
    private const string AppBaseUrl = "https://mjolksyra.com";

    public ClerkWebhookController(
        IOptions<ClerkOptions> options,
        IMediator mediator,
        IEmailSender emailSender,
        ILogger<ClerkWebhookController> logger)
    {
        _options = options.Value;
        _mediator = mediator;
        _emailSender = emailSender;
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
            case "invitation.created":
            {
                var email = TryGetString(data, "email_address");
                if (string.IsNullOrWhiteSpace(email))
                {
                    _logger.LogWarning("Received invitation.created webhook without email_address.");
                    break;
                }

                var invitationLink = TryGetString(data, "url")
                                     ?? $"{AppBaseUrl}/sign-in?redirect_url=%2Fapp";
                await _emailSender.SendClerkInvitation(email, new ClerkInvitationEmail
                {
                    SignInLink = invitationLink
                }, HttpContext.RequestAborted);
                break;
            }
            case "invitation.accepted":
            {
                var email = TryGetString(data, "email_address");
                if (string.IsNullOrWhiteSpace(email))
                {
                    _logger.LogWarning("Received invitation.accepted webhook without email_address.");
                    break;
                }

                await _emailSender.SendClerkInvitationAccepted(email, new ClerkInvitationAcceptedEmail
                {
                    AppLink = $"{AppBaseUrl}/app"
                }, HttpContext.RequestAborted);
                break;
            }

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

    private static string? TryGetString(JsonElement root, string propertyName)
    {
        return root.TryGetProperty(propertyName, out var element) &&
               element.ValueKind == JsonValueKind.String
            ? element.GetString()
            : null;
    }
}
