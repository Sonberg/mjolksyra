using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Mjolksyra.Api.Options;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Stripe;

namespace Mjolksyra.Api.Controllers.Stripe;

[ApiController]
[Route("api/stripe/webhook")]
public class WebhookController : Controller
{
    private readonly StripeOptions _options;

    private readonly IStripeClient _stripeClient;

    private readonly IUserRepository _userRepository;

    public WebhookController(
        IOptions<StripeOptions> options,
        IStripeClient stripeClient,
        IUserRepository userRepository)
    {
        _options = options.Value;
        _stripeClient = stripeClient;
        _userRepository = userRepository;
    }

    [HttpPost]
    public async Task<ActionResult> Webhook()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
        var stripeEvent = EventUtility.ConstructEvent(json,
            Request.Headers["Stripe-Signature"],
            _options.WebhookSecret);

        switch (stripeEvent)
        {
            case { Data.Object: SetupIntent intent }:
                await Handle(intent);
                break;

            case { Data.Object: Account account }:
                await Handle(account);
                break;
        }

        return Ok();
    }


    private async Task Handle(SetupIntent intent)
    {
        var userId = Guid.Parse(intent.Metadata["UserId"]);
        var user = await _userRepository.GetById(userId, CancellationToken.None);
        var service = new SetupIntentService(_stripeClient);

        user.Athlete!.Stripe!.Status = intent.Status switch
        {
            "requires_payment_method" => StripeStatus.RequiresPaymentMethod,
            "requires_confirmation" => StripeStatus.RequiresConfirmation,
            "processing" => StripeStatus.Processing,
            "succeeded" => StripeStatus.Succeeded,
            "requires_action" => StripeStatus.RequiresAction,
            "canceled" => StripeStatus.Canceled,
            _ => throw new ArgumentOutOfRangeException()
        };

        await service.ConfirmAsync(intent.Id, new SetupIntentConfirmOptions
        {
            PaymentMethod = intent.PaymentMethodId
        });

        await _userRepository.Update(user, CancellationToken.None);
    }

    private async Task Handle(Account account)
    {
        var userId = Guid.Parse(account.Metadata["UserId"]);
        var user = await _userRepository.GetById(userId, CancellationToken.None);

        user.Coach!.Stripe!.Status = account switch
        {
            { PayoutsEnabled: true, ChargesEnabled: true } => StripeStatus.Succeeded,
            _ => StripeStatus.RequiresAction
        };

        user.Coach.Stripe.Message = account.Requirements.CurrentlyDue.Count > 0
            ? "Please complete the onboarding process"
            : "Onboarding completed";

        await _userRepository.Update(user, CancellationToken.None);
    }
}