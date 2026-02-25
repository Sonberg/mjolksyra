using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.UseCases.Trainees.UpdateTrianeeCost;

namespace Mjolksyra.UseCases.Trainees.ChargeNowTrainee;

public class ChargeNowTraineeCommandHandler : IRequestHandler<ChargeNowTraineeCommand>
{
    private readonly ITraineeRepository _traineeRepository;
    private readonly IUserRepository _userRepository;
    private readonly IMediator _mediator;
    private readonly IEmailSender _emailSender;
    private readonly INotificationService _notificationService;

    public ChargeNowTraineeCommandHandler(
        ITraineeRepository traineeRepository,
        IUserRepository userRepository,
        IMediator mediator,
        IEmailSender emailSender,
        INotificationService notificationService)
    {
        _traineeRepository = traineeRepository;
        _userRepository = userRepository;
        _mediator = mediator;
        _emailSender = emailSender;
        _notificationService = notificationService;
    }

    public async Task Handle(ChargeNowTraineeCommand request, CancellationToken cancellationToken)
    {
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null) return;
        if (trainee.CoachUserId != request.UserId) return;
        if (trainee.Cost.Amount <= 0) return;

        var athlete = await _userRepository.GetById(trainee.AthleteUserId, cancellationToken);
        var coach = await _userRepository.GetById(trainee.CoachUserId, cancellationToken);

        var athletePaymentReady =
            athlete.Athlete?.Stripe?.CustomerId is not null &&
            athlete.Athlete.Stripe.PaymentMethodId is not null &&
            athlete.Athlete.Stripe.Status == StripeStatus.Succeeded;
        var coachStripeReady =
            coach.Coach?.Stripe?.AccountId is not null &&
            coach.Coach.Stripe.Status == StripeStatus.Succeeded;

        if (!athletePaymentReady || !coachStripeReady)
        {
            return;
        }

        // Reuse existing subscription recreation flow to charge immediately and reset billing cycle.
        await _mediator.Send(new UpdateTraineeCostCommand
        {
            TraineeId = request.TraineeId,
            UserId = request.UserId,
            Amount = trainee.Cost.Amount,
            SuppressPriceChangedNotification = true
        }, cancellationToken);

        await _emailSender.SendChargeNowToAthlete(athlete.Email.Value, new AthleteBillingEmail
        {
            Coach = DisplayName(coach),
            Athlete = DisplayName(athlete),
            Email = athlete.Email.Value,
            PriceSek = trainee.Cost.Amount,
            Date = DateTimeOffset.UtcNow.ToString("yyyy-MM-dd"),
            NextChargeDate = DateTimeOffset.UtcNow.AddMonths(1).ToString("yyyy-MM-dd")
        }, cancellationToken);

        await _notificationService.Notify(coach.Id,
            "billing.charge-now",
            "Charged athlete now",
            $"Charged {DisplayName(athlete)} {trainee.Cost.Amount} SEK and reset billing cycle.",
            "/app/coach/athletes",
            cancellationToken);

        await _notificationService.Notify(athlete.Id,
            "billing.charge-now",
            "You were charged",
            $"{DisplayName(coach)} charged {trainee.Cost.Amount} SEK today and reset your monthly billing cycle.",
            "/app/athlete",
            cancellationToken);
    }

    private static string DisplayName(Mjolksyra.Domain.Database.Models.User user)
        => string.Join(" ", new[]
            {
                user.GivenName, user.FamilyName
            }.Where(x => !string.IsNullOrWhiteSpace(x))).Trim() switch
            {
                "" => user.Email.Value,
                var value => value
            };
}
