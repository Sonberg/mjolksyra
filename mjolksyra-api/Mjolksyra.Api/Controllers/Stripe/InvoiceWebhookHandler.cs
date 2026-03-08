using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using Stripe;

namespace Mjolksyra.Api.Controllers.Stripe;

public class InvoiceWebhookHandler
{
    private readonly ITraineeRepository _traineeRepository;
    private readonly IUserRepository _userRepository;
    private readonly ITraineeTransactionRepository _transactionRepository;
    private readonly IEmailSender _emailSender;
    private readonly INotificationService _notificationService;
    private readonly IConfiguration _configuration;

    public InvoiceWebhookHandler(
        ITraineeRepository traineeRepository,
        IUserRepository userRepository,
        ITraineeTransactionRepository transactionRepository,
        IEmailSender emailSender,
        INotificationService notificationService,
        IConfiguration configuration)
    {
        _traineeRepository = traineeRepository;
        _userRepository = userRepository;
        _transactionRepository = transactionRepository;
        _emailSender = emailSender;
        _notificationService = notificationService;
        _configuration = configuration;
    }

    public async Task HandleSucceeded(Invoice invoice)
    {
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
            Coach = DisplayName(coach),
            Athlete = DisplayName(athlete),
            Email = athlete.Email.Value,
            PriceSek = trainee.Cost.Amount,
            Date = DateTimeOffset.UtcNow.ToString("yyyy-MM-dd"),
            NextChargeDate = DateTimeOffset.UtcNow.AddMonths(1).ToString("yyyy-MM-dd")
        }, CancellationToken.None);

        await _notificationService.Notify(athlete.Id,
            "billing.payment-succeeded",
            "Payment succeeded",
            $"Payment for {trainee.Cost.Amount} SEK to {DisplayName(coach)} was successful.",
            "/app/athlete",
            CancellationToken.None);

        await _notificationService.Notify(coach.Id,
            "billing.payment-succeeded",
            "Athlete payment succeeded",
            $"{DisplayName(athlete)} payment of {trainee.Cost.Amount} SEK succeeded.",
            "/app/coach/athletes",
            CancellationToken.None);
    }

    public async Task HandleFailed(Invoice invoice)
    {
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
            Coach = DisplayName(coach),
            Athlete = DisplayName(athlete),
            Email = athlete.Email.Value,
            PriceSek = trainee.Cost.Amount,
            Link = $"{GetAppBaseUrl()}/app/athlete",
            Reason = invoice.Description ?? invoice.Status
        };

        await _emailSender.SendPaymentFailedToAthlete(athlete.Email.Value, billingEmail, CancellationToken.None);
        await _emailSender.SendPaymentFailedToCoach(coach.Email.Value, billingEmail, CancellationToken.None);

        await _notificationService.Notify(athlete.Id,
            "billing.payment-failed",
            "Payment failed",
            "Your coaching payment failed. Update your payment method to continue.",
            "/app/athlete",
            CancellationToken.None);

        await _notificationService.Notify(coach.Id,
            "billing.payment-failed",
            "Athlete payment failed",
            $"{DisplayName(athlete)} payment failed.",
            "/app/coach/athletes",
            CancellationToken.None);
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
