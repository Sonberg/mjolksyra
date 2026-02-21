using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Mjolksyra.Api.Options;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Stripe;

namespace Mjolksyra.Api.Controllers.Stripe;

[ApiController]
[Route("api/stripe/webhook")]
public class WebhookController : Controller
{
    private readonly StripeOptions _options;

    private readonly IStripeClient _stripeClient;

    private readonly IUserRepository _userRepository;

    private readonly ITraineeRepository _traineeRepository;

    public WebhookController(
        IOptions<StripeOptions> options,
        IStripeClient stripeClient,
        IUserRepository userRepository,
        ITraineeRepository traineeRepository)
    {
        _options = options.Value;
        _stripeClient = stripeClient;
        _userRepository = userRepository;
        _traineeRepository = traineeRepository;
    }

    [HttpPost]
    public async Task<ActionResult> Handle()
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

            case { Type: "invoice.payment_succeeded", Data.Object: Invoice invoice }:
                await HandleInvoiceSucceeded(invoice);
                break;

            case { Type: "invoice.payment_failed", Data.Object: Invoice invoice }:
                await HandleInvoiceFailed(invoice);
                break;

            case { Type: "customer.subscription.deleted", Data.Object: Subscription subscription }:
                await HandleSubscriptionDeleted(subscription);
                break;
        }

        return Ok();
    }


    private async Task Handle(SetupIntent intent)
    {
        var userId = Guid.Parse(intent.Metadata["UserId"]);
        var user = await _userRepository.GetById(userId, CancellationToken.None);
        var service = new SetupIntentService(_stripeClient);

        user.Athlete!.Stripe!.PaymentMethodId = intent.PaymentMethodId;
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

        if (intent.Status == "requires_confirmation")
        {
            await service.ConfirmAsync(intent.Id, new SetupIntentConfirmOptions
            {
                PaymentMethod = intent.PaymentMethodId
            });
        }

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

    private async Task HandleInvoiceSucceeded(Invoice invoice)
    {
        if (invoice.SubscriptionId is null) return;

        var trainee = await _traineeRepository.GetBySubscriptionId(invoice.SubscriptionId, CancellationToken.None);
        if (trainee is null) return;

        var transactionCost = TraineeTransactionCost.From(trainee.Cost);
        trainee.Transactions.Add(new TraineeTransaction
        {
            Id = Guid.NewGuid(),
            PaymentIntentId = invoice.Id,
            Cost = transactionCost,
            Status = TraineeTransactionStatus.Succeeded,
            StatusRaw = "invoice.payment_succeeded",
            CreatedAt = DateTimeOffset.UtcNow,
        });

        await _traineeRepository.Update(trainee, CancellationToken.None);
    }

    private async Task HandleInvoiceFailed(Invoice invoice)
    {
        if (invoice.SubscriptionId is null) return;

        var trainee = await _traineeRepository.GetBySubscriptionId(invoice.SubscriptionId, CancellationToken.None);
        if (trainee is null) return;

        var transactionCost = TraineeTransactionCost.From(trainee.Cost);
        trainee.Transactions.Add(new TraineeTransaction
        {
            Id = Guid.NewGuid(),
            PaymentIntentId = invoice.Id,
            Cost = transactionCost,
            Status = TraineeTransactionStatus.Failed,
            StatusRaw = "invoice.payment_failed",
            CreatedAt = DateTimeOffset.UtcNow,
        });

        await _traineeRepository.Update(trainee, CancellationToken.None);
    }

    private async Task HandleSubscriptionDeleted(Subscription subscription)
    {
        var trainee = await _traineeRepository.GetBySubscriptionId(subscription.Id, CancellationToken.None);
        if (trainee is null) return;

        trainee.Status = TraineeStatus.Cancelled;
        trainee.StripeSubscriptionId = null;

        await _traineeRepository.Update(trainee, CancellationToken.None);
    }
}
