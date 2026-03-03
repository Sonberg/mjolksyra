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
                Coach = DisplayName(coach),
                Athlete = DisplayName(athlete),
                Email = athlete.Email.Value,
                PriceSek = trainee.Cost.Amount
            }, cancellationToken);
        }

        await _notificationService.Notify(coach.Id,
            "billing.price-changed",
            "Price updated",
            $"Monthly coaching price set to {trainee.Cost.Amount} SEK for {DisplayName(athlete)}.",
            "/app/coach/athletes",
            cancellationToken);

        await _notificationService.Notify(athlete.Id,
            "billing.price-changed",
            "Price updated",
            $"{DisplayName(coach)} set your monthly coaching price to {trainee.Cost.Amount} SEK.",
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
