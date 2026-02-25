using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Mjolksyra.Api.Options;
using Mjolksyra.Api.Common.UserEvents;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
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
    private readonly IUserEventPublisher _userEvents;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;

    public WebhookController(
        IOptions<StripeOptions> options,
        IStripeClient stripeClient,
        IUserRepository userRepository,
        ITraineeRepository traineeRepository,
        IUserEventPublisher userEvents,
        IEmailSender emailSender,
        IConfiguration configuration)
    {
        _options = options.Value;
        _stripeClient = stripeClient;
        _userRepository = userRepository;
        _traineeRepository = traineeRepository;
        _userEvents = userEvents;
        _emailSender = emailSender;
        _configuration = configuration;
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
        await _userEvents.Publish(user.Id, "user.updated", new
        {
            scope = "athlete-stripe",
            status = user.Athlete!.Stripe!.Status.ToString()
        });
    }

    private async Task Handle(Account account)
    {
        var userId = Guid.Parse(account.Metadata["UserId"]);
        var user = await _userRepository.GetById(userId, CancellationToken.None);
        var previousStatus = user.Coach?.Stripe?.Status;

        user.Coach!.Stripe!.Status = account switch
        {
            { PayoutsEnabled: true, ChargesEnabled: true } => StripeStatus.Succeeded,
            _ => StripeStatus.RequiresAction
        };

        user.Coach.Stripe.Message = account.Requirements.CurrentlyDue.Count > 0
            ? "Please complete the onboarding process"
            : "Onboarding completed";

        await _userRepository.Update(user, CancellationToken.None);
        await _userEvents.Publish(user.Id, "user.updated", new
        {
            scope = "coach-stripe",
            status = user.Coach!.Stripe!.Status.ToString()
        });

        if (user.Coach?.Stripe is not null && previousStatus != user.Coach.Stripe.Status)
        {
            await _emailSender.SendCoachStripeStatusToCoach(user.Email.Value, new CoachStripeStatusEmail
            {
                Coach = DisplayName(user),
                Email = user.Email.Value,
                Status = user.Coach.Stripe.Status.ToString(),
                Message = user.Coach.Stripe.Message
            }, CancellationToken.None);
        }
    }

    private async Task HandleInvoiceSucceeded(Invoice invoice)
    {
        if (invoice.SubscriptionId is null) return;

        var trainee = await _traineeRepository.GetBySubscriptionId(invoice.SubscriptionId, CancellationToken.None);
        if (trainee is null) return;
        var athlete = await _userRepository.GetById(trainee.AthleteUserId, CancellationToken.None);
        var coach = await _userRepository.GetById(trainee.CoachUserId, CancellationToken.None);

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

        await _emailSender.SendPaymentSucceededToAthlete(athlete.Email.Value, new AthleteBillingEmail
        {
            Coach = DisplayName(coach),
            Athlete = DisplayName(athlete),
            Email = athlete.Email.Value,
            PriceSek = trainee.Cost.Amount,
            Date = DateTimeOffset.UtcNow.ToString("yyyy-MM-dd"),
            NextChargeDate = DateTimeOffset.UtcNow.AddMonths(1).ToString("yyyy-MM-dd")
        }, CancellationToken.None);
    }

    private async Task HandleInvoiceFailed(Invoice invoice)
    {
        if (invoice.SubscriptionId is null) return;

        var trainee = await _traineeRepository.GetBySubscriptionId(invoice.SubscriptionId, CancellationToken.None);
        if (trainee is null) return;
        var athlete = await _userRepository.GetById(trainee.AthleteUserId, CancellationToken.None);
        var coach = await _userRepository.GetById(trainee.CoachUserId, CancellationToken.None);

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

        var billingEmail = new AthleteBillingEmail
        {
            Coach = DisplayName(coach),
            Athlete = DisplayName(athlete),
            Email = athlete.Email.Value,
            PriceSek = trainee.Cost.Amount,
            Link = $"{GetAppBaseUrl()}/app/athlete",
            Reason = invoice.Description ?? invoice.Status
        };

        await _emailSender.SendPaymentFailedToAthlete(athlete.Email.Value, billingEmail, CancellationToken.None);
        await _emailSender.SendPaymentFailedToCoach(coach.Email.Value, billingEmail, CancellationToken.None);
    }

    private async Task HandleSubscriptionDeleted(Subscription subscription)
    {
        var trainee = await _traineeRepository.GetBySubscriptionId(subscription.Id, CancellationToken.None);
        if (trainee is null) return;

        trainee.Status = TraineeStatus.Cancelled;
        trainee.StripeSubscriptionId = null;

        await _traineeRepository.Update(trainee, CancellationToken.None);
    }

    private string GetAppBaseUrl() => _configuration["App:BaseUrl"] ?? "http://localhost:3000";

    private static string DisplayName(User user)
        => string.Join(" ", new[]
            {
                user.GivenName, user.FamilyName
            }.Where(x => !string.IsNullOrWhiteSpace(x))).Trim() switch
        {
            "" => user.Email.Value,
            var value => value
        };
}
