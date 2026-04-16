using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Notifications;

namespace Mjolksyra.UseCases.Trainees.RefundTraineeTransaction;

public class RefundTraineeTransactionCommandHandler : IRequestHandler<RefundTraineeTransactionCommand>
{
    private readonly ITraineeRepository _traineeRepository;
    private readonly ITraineeTransactionRepository _transactionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IStripeRefundGateway _stripeRefundGateway;
    private readonly INotificationService _notificationService;

    public RefundTraineeTransactionCommandHandler(
        ITraineeRepository traineeRepository,
        ITraineeTransactionRepository transactionRepository,
        IUserRepository userRepository,
        IStripeRefundGateway stripeRefundGateway,
        INotificationService notificationService)
    {
        _traineeRepository = traineeRepository;
        _transactionRepository = transactionRepository;
        _userRepository = userRepository;
        _stripeRefundGateway = stripeRefundGateway;
        _notificationService = notificationService;
    }

    public async Task Handle(RefundTraineeTransactionCommand request, CancellationToken cancellationToken)
    {
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null) return;
        if (trainee.CoachUserId != request.UserId) return;

        var transaction = await _transactionRepository.GetById(request.TransactionId, cancellationToken);
        if (transaction is null) return;
        if (transaction.TraineeId != request.TraineeId) return;
        if (transaction.Status != TraineeTransactionStatus.Succeeded) return;

        await _stripeRefundGateway.RefundInvoiceAsync(transaction.PaymentIntentId, cancellationToken);

        transaction.Status = TraineeTransactionStatus.Refunded;
        transaction.StatusRaw = "refunded";

        await _transactionRepository.Upsert(transaction, cancellationToken);

        var coach = await _userRepository.GetById(trainee.CoachUserId, cancellationToken);
        var athlete = await _userRepository.GetById(trainee.AthleteUserId, cancellationToken);

        var amount = transaction.Cost.Total;
        var currency = transaction.Cost.Currency.ToUpperInvariant();
        var coachName = DisplayName(coach);
        var athleteName = DisplayName(athlete);

        await _notificationService.Notify(new NotificationRequest
        {
            UserId = athlete.Id,
            Type = "billing.refunded",
            Title = "Payment refunded",
            Body = $"Your payment of {amount} {currency} was refunded by {coachName}.",
            Href = "/app/athlete",
        }, cancellationToken);

        await _notificationService.Notify(new NotificationRequest
        {
            UserId = coach.Id,
            Type = "billing.refunded",
            Title = "Refund issued",
            Body = $"You refunded {athleteName} {amount} {currency}.",
            Href = "/app/coach/athletes",
        }, cancellationToken);
    }

    private static string DisplayName(Mjolksyra.Domain.Database.Models.User user)
        => string.Join(" ", new[] { user.GivenName, user.FamilyName }
            .Where(x => !string.IsNullOrWhiteSpace(x))).Trim() switch
        {
            "" => user.Email.Value,
            var value => value
        };
}
