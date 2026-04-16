using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.UseCases.Coaches.AddPurchasedCredits;
using Mjolksyra.UseCases.Coaches.ResetUserCredits;
using Stripe;

namespace Mjolksyra.Api.Controllers.Stripe;

public class InvoiceWebhookHandler
{
    private readonly ITraineeRepository _traineeRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITraineeTransactionRepository _transactionRepository;
    private readonly IEmailSender _emailSender;
    private readonly INotificationService _notificationService;
    private readonly IProcessedStripeEventRepository _processedStripeEventRepository;
    private readonly IMediator _mediator;

    public InvoiceWebhookHandler(
        ITraineeRepository traineeRepository,
        IUserRepository userRepository,
        ITraineeTransactionRepository transactionRepository,
        IEmailSender emailSender,
        INotificationService notificationService,
        IProcessedStripeEventRepository processedStripeEventRepository,
        IMediator mediator)
    {
        _traineeRepository = traineeRepository;
        _userRepository = userRepository;
        _transactionRepository = transactionRepository;
        _emailSender = emailSender;
        _notificationService = notificationService;
        _processedStripeEventRepository = processedStripeEventRepository;
        _mediator = mediator;
    }

    public async Task HandleSucceeded(Invoice invoice, string eventId)
    {
        if (!await _processedStripeEventRepository.TryMarkAsProcessed(eventId, "invoice.payment_succeeded", CancellationToken.None))
        {
            return;
        }

        if (invoice.Metadata.TryGetValue("type", out var invoiceType)
            && invoiceType == "credits-pack"
            && invoice.Metadata.TryGetValue("packId", out var packIdRaw)
            && invoice.Metadata.TryGetValue("coachUserId", out var coachUserIdRaw)
            && Guid.TryParse(packIdRaw, out var packId)
            && Guid.TryParse(coachUserIdRaw, out var coachUserId))
        {
            await _mediator.Send(new AddPurchasedCreditsCommand(coachUserId, packId, eventId));
            return;
        }

        if (invoice.SubscriptionId is not null)
        {
            var platformCoach = await _userRepository.GetByPlatformSubscriptionId(invoice.SubscriptionId, CancellationToken.None);
            if (platformCoach is not null)
            {
                await _mediator.Send(new ResetUserCreditsCommand(platformCoach.Id), CancellationToken.None);
            }
        }

        if (invoice.SubscriptionId is null) return;

        var trainee = await _traineeRepository.GetBySubscriptionId(invoice.SubscriptionId, CancellationToken.None);
        if (trainee is null) return;
        var athlete = await _userRepository.GetById(trainee.AthleteUserId, CancellationToken.None);
        var coach = await _userRepository.GetById(trainee.CoachUserId, CancellationToken.None);

        var transaction = new TraineeTransaction
        {
            Id = Guid.NewGuid(),
            TraineeId = trainee.Id,
            PaymentIntentId = invoice.PaymentIntentId,
            ReceiptUrl = invoice.HostedInvoiceUrl ?? invoice.InvoicePdf,
            Cost = TraineeTransactionCost.From(trainee.Cost),
            Status = TraineeTransactionStatus.Succeeded,
            StatusRaw = "invoice.payment_succeeded",
            CreatedAt = DateTimeOffset.UtcNow,
        };

        await _transactionRepository.Upsert(transaction, CancellationToken.None);

        if (trainee.PaymentFailedAt != null)
        {
            trainee.PaymentFailedAt = null;
            await _traineeRepository.Update(trainee, CancellationToken.None);
        }

        await _emailSender.SendPaymentSucceededToAthlete(athlete.Email.Value, new AthleteBillingEmail
        {
            Coach = coach,
            Athlete = athlete,
            PriceSek = trainee.Cost.Amount,
            NextChargeDate = DateTimeOffset.UtcNow.AddMonths(1).ToString("yyyy-MM-dd")
        }, CancellationToken.None);

        await _notificationService.Notify(new NotificationRequest
        {
            UserId = athlete.Id,
            Type = "billing.payment-succeeded",
            Title = "Payment succeeded",
            Body = $"Payment for {trainee.Cost.Amount} SEK to {coach.DisplayName} was successful.",
            Href = "/app/athlete",
        }, CancellationToken.None);

        await _notificationService.Notify(new NotificationRequest
        {
            UserId = coach.Id,
            Type = "billing.payment-succeeded",
            Title = "Athlete payment succeeded",
            Body = $"{athlete.DisplayName} payment of {trainee.Cost.Amount} SEK succeeded.",
            Href = "/app/coach/athletes",
        }, CancellationToken.None);
    }

    public async Task HandleFailed(Invoice invoice, string eventId)
    {
        if (!await _processedStripeEventRepository.TryMarkAsProcessed(eventId, "invoice.payment_failed", CancellationToken.None))
        {
            return;
        }

        if (invoice.SubscriptionId is null) return;

        var trainee = await _traineeRepository.GetBySubscriptionId(invoice.SubscriptionId, CancellationToken.None);
        if (trainee is null) return;
        var athlete = await _userRepository.GetById(trainee.AthleteUserId, CancellationToken.None);
        var coach = await _userRepository.GetById(trainee.CoachUserId, CancellationToken.None);

        var transaction = new TraineeTransaction
        {
            Id = Guid.NewGuid(),
            TraineeId = trainee.Id,
            PaymentIntentId = invoice.PaymentIntentId,
            ReceiptUrl = invoice.HostedInvoiceUrl ?? invoice.InvoicePdf,
            Cost = TraineeTransactionCost.From(trainee.Cost),
            Status = TraineeTransactionStatus.Failed,
            StatusRaw = "invoice.payment_failed",
            CreatedAt = DateTimeOffset.UtcNow,
        };

        await _transactionRepository.Upsert(transaction, CancellationToken.None);

        trainee.PaymentFailedAt = DateTimeOffset.UtcNow;
        await _traineeRepository.Update(trainee, CancellationToken.None);

        var billingEmail = new AthleteBillingEmail
        {
            Coach = coach,
            Athlete = athlete,
            PriceSek = trainee.Cost.Amount
        };

        await _emailSender.SendPaymentFailedToAthlete(athlete.Email.Value, billingEmail, CancellationToken.None);
        await _emailSender.SendPaymentFailedToCoach(coach.Email.Value, billingEmail, CancellationToken.None);

        await _notificationService.Notify(new NotificationRequest
        {
            UserId = athlete.Id,
            Type = "billing.payment-failed",
            Title = "Payment failed",
            Body = "Your coaching payment failed. Update your payment method to continue.",
            Href = "/app/athlete",
        }, CancellationToken.None);

        await _notificationService.Notify(new NotificationRequest
        {
            UserId = coach.Id,
            Type = "billing.payment-failed",
            Title = "Athlete payment failed",
            Body = $"{athlete.DisplayName} payment failed.",
            Href = "/app/coach/athletes",
        }, CancellationToken.None);
    }
}
