using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.Notifications;

namespace Mjolksyra.UseCases.Trainees.UpdateTrianeeCost;

public class UpdateTraineeCostCommandHandler : IRequestHandler<UpdateTraineeCostCommand>
{
    private readonly ITraineeRepository _traineeRepository;

    private readonly IUserRepository _userRepository;

    private readonly IEmailSender _emailSender;
    private readonly INotificationService _notificationService;
    private readonly ITraineeSubscriptionSyncPublisher _traineeSubscriptionSyncPublisher;

    public UpdateTraineeCostCommandHandler(
        ITraineeRepository traineeRepository,
        IUserRepository userRepository,
        IEmailSender emailSender,
        INotificationService notificationService,
        ITraineeSubscriptionSyncPublisher traineeSubscriptionSyncPublisher)
    {
        _traineeRepository = traineeRepository;
        _userRepository = userRepository;
        _emailSender = emailSender;
        _notificationService = notificationService;
        _traineeSubscriptionSyncPublisher = traineeSubscriptionSyncPublisher;
    }

    public async Task Handle(UpdateTraineeCostCommand request, CancellationToken cancellationToken)
    {
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee?.CoachUserId != request.UserId) return;

        trainee.Cost.Amount = request.Amount;

        var athlete = await _userRepository.GetById(trainee.AthleteUserId, cancellationToken);
        var coach = await _userRepository.GetById(trainee.CoachUserId, cancellationToken);

        await _traineeRepository.Update(trainee, cancellationToken);
        await _traineeSubscriptionSyncPublisher.Publish(
            new TraineeSubscriptionSyncMessage
            {
                TraineeId = trainee.Id,
                BillingMode = request.BillingMode == PriceChangeBillingMode.NextCycle
                    ? TraineeSubscriptionSyncBillingMode.NextCycle
                    : TraineeSubscriptionSyncBillingMode.ChargeNow
            },
            cancellationToken);

        if (athlete is null || coach is null)
        {
            return;
        }

        if (!request.SuppressPriceChangedNotification)
        {
            await _emailSender.SendPriceChangedToAthlete(athlete.Email.Value, new AthleteBillingEmail
            {
                Coach = coach,
                Athlete = athlete,
                PriceSek = trainee.Cost.Amount
            }, cancellationToken);
        }

        await _notificationService.Notify(new NotificationRequest
        {
            UserId = coach.Id,
            Type = "billing.price-changed",
            Title = "Price updated",
            Body = $"Monthly coaching price set to {trainee.Cost.Amount} SEK for {athlete.DisplayName}.",
            Href = "/app/coach/athletes",
        }, cancellationToken);

        await _notificationService.Notify(new NotificationRequest
        {
            UserId = athlete.Id,
            Type = "billing.price-changed",
            Title = "Price updated",
            Body = $"{coach.DisplayName} set your monthly coaching price to {trainee.Cost.Amount} SEK.",
            Href = "/app/athlete",
        }, cancellationToken);
    }
}
