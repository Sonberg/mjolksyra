using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Mjolksyra.Api.Options;
using Stripe;

namespace Mjolksyra.Api.Controllers.Stripe;

[ApiController]
[Route("api/stripe/webhook")]
public class WebhookController : Controller
{
    private readonly StripeOptions _options;

    public WebhookController(IOptions<StripeOptions> options)
    {
        _options = options.Value;
    }

    public async Task<ActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var stripeEvent = EventUtility.ConstructEvent(json,
            Request.Headers["Stripe-Signature"],
            _options.WebhookSecret);

        switch (stripeEvent)
        {
            case { Type: "setup_intent.succeeded", Data.Object: SetupIntent intent }:
                var customerId = intent.Customer.Id;
                // Handle the event
                break;
        }

        return Ok();
    }
}