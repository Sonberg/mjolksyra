using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using MediatR;
using Mjolksyra.Api.Options;
using Mjolksyra.Api.Common.UserEvents;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;
using Mjolksyra.UseCases.Trainees.TriggerMissingSubscriptionsForUser;
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
    private readonly INotificationService _notificationService;
    private readonly ILogger<WebhookController> _logger;
    private readonly IMediator _mediator;
    private readonly InvoiceWebhookHandler _invoiceHandler;

    public WebhookController(
        IOptions<StripeOptions> options,
        IStripeClient stripeClient,
        IUserRepository userRepository,
        ITraineeRepository traineeRepository,
        IUserEventPublisher userEvents,
        IEmailSender emailSender,
        INotificationService notificationService,
        ILogger<WebhookController> logger,
        IMediator mediator,
        InvoiceWebhookHandler invoiceHandler)
    {
        _options = options.Value;
        _stripeClient = stripeClient;
        _userRepository = userRepository;
        _traineeRepository = traineeRepository;
        _userEvents = userEvents;
        _emailSender = emailSender;
        _notificationService = notificationService;
        _logger = logger;
        _mediator = mediator;
        _invoiceHandler = invoiceHandler;
    }

    [HttpPost]
    public async Task<ActionResult> Handle()
    {
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                _options.WebhookSecret);
        }
        catch (Exception ex) when (ex is StripeException or ArgumentException)
        {
            _logger.LogWarning(ex, "Rejected Stripe webhook due to invalid payload/signature.");
            return BadRequest();
        }

        switch (stripeEvent.Type)
        {
            case "setup_intent.succeeded":
            case "setup_intent.processing":
            case "setup_intent.requires_action":
            case "setup_intent.requires_confirmation":
            case "setup_intent.requires_payment_method":
            case "setup_intent.canceled":
            case "setup_intent.setup_failed":
                if (stripeEvent.Data.Object is SetupIntent setupIntent)
                {
                    await HandleSetupIntent(setupIntent);
                }

                break;
            case "account.updated":
                if (stripeEvent.Data.Object is Account account)
                {
                    await HandleAccountUpdated(account);
                }

                break;
            case "invoice.payment_succeeded":
                if (stripeEvent.Data.Object is Invoice invoiceSucceeded)
                {
                    await _invoiceHandler.HandleSucceeded(invoiceSucceeded, stripeEvent.Id);
                }

                break;
            case "invoice.payment_failed":
                if (stripeEvent.Data.Object is Invoice invoiceFailed)
                {
                    await _invoiceHandler.HandleFailed(invoiceFailed, stripeEvent.Id);
                }

                break;
            case "customer.subscription.deleted":
                if (stripeEvent.Data.Object is Subscription subscription)
                {
                    await HandleSubscriptionDeleted(subscription);
                }

                break;
        }

        return Ok();
    }


    private async Task HandleSetupIntent(SetupIntent intent)
    {
        if (!intent.Metadata.TryGetValue("UserId", out var userIdRaw) || !Guid.TryParse(userIdRaw, out var userId))
        {
            _logger.LogInformation(
                "Skipping setup_intent webhook without valid UserId metadata. SetupIntentId={SetupIntentId}",
                intent.Id);
            return;
        }

        var user = await _userRepository.GetById(userId, CancellationToken.None);
        if (user?.Athlete is null)
        {
            return;
        }

        var service = new SetupIntentService(_stripeClient);

        user.Athlete.Stripe ??= new UserAthleteStripe();
        user.Athlete.Stripe.PaymentMethodId = intent.PaymentMethodId;
        user.Athlete.Stripe.Status = intent.Status switch
        {
            "requires_payment_method" => StripeStatus.RequiresPaymentMethod,
            "requires_confirmation" => StripeStatus.RequiresConfirmation,
            "processing" => StripeStatus.Processing,
            "succeeded" => StripeStatus.Succeeded,
            "requires_action" => StripeStatus.RequiresAction,
            "canceled" => StripeStatus.Canceled,
            _ => StripeStatus.RequiresPaymentMethod
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
            status = user.Athlete.Stripe.Status.ToString()
        });
    }

    private async Task HandleAccountUpdated(Account account)
    {
        if (!account.Metadata.TryGetValue("UserId", out var userIdRaw) || !Guid.TryParse(userIdRaw, out var userId))
        {
            _logger.LogInformation(
                "Skipping account.updated webhook without valid UserId metadata. AccountId={AccountId}",
                account.Id);
            return;
        }

        var user = await _userRepository.GetById(userId, CancellationToken.None);
        if (user?.Coach is null)
        {
            return;
        }

        var coach = user.Coach;
        var previousStatus = coach.Stripe?.Status;
        var currentlyDueCount = account.Requirements?.CurrentlyDue?.Count ?? 0;

        coach.Stripe ??= new UserCoachStripe();
        coach.Stripe.Status =
            account.PayoutsEnabled && currentlyDueCount == 0
                ? StripeStatus.Succeeded
                : StripeStatus.RequiresAction;

        coach.Stripe.Message = currentlyDueCount > 0
            ? "Please complete the onboarding process"
            : "Onboarding completed";

        await _userRepository.Update(user, CancellationToken.None);
        await _userEvents.Publish(user.Id, "user.updated", new
        {
            scope = "coach-stripe",
            status = coach.Stripe.Status.ToString()
        });

        if (coach.Stripe.Status == StripeStatus.Succeeded)
        {
            await _mediator.Send(new EnsureCoachPlatformSubscriptionCommand(user.Id));
            await _mediator.Send(new TriggerMissingSubscriptionsForUserCommand(userId));
        }

        if (previousStatus != coach.Stripe.Status)
        {
            await _emailSender.SendCoachStripeStatusToCoach(user.Email.Value, new CoachStripeStatusEmail
            {
                Coach = user,
                Status = coach.Stripe.Status
            }, CancellationToken.None);

            await _notificationService.Notify(user.Id,
                "coach.stripe-status",
                "Stripe account status updated",
                coach.Stripe.Message,
                "/app/coach/dashboard",
                CancellationToken.None);
        }
    }

    private async Task HandleSubscriptionDeleted(Subscription subscription)
    {
        var trainee = await _traineeRepository.GetBySubscriptionId(subscription.Id, CancellationToken.None);
        if (trainee is null) return;

        trainee.Status = TraineeStatus.Cancelled;
        trainee.DeletedAt = DateTimeOffset.UtcNow;
        trainee.StripeSubscriptionId = null;

        await _traineeRepository.Update(trainee, CancellationToken.None);
        await _mediator.Send(new EnsureCoachPlatformSubscriptionCommand(trainee.CoachUserId));

        await _notificationService.NotifyMany(
            [trainee.CoachUserId, trainee.AthleteUserId],
            "billing.subscription-ended",
            "Subscription ended",
            "Recurring billing subscription was cancelled.",
            trainee.CoachUserId == trainee.AthleteUserId ? "/app" : null,
            CancellationToken.None);
    }

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