using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using Stripe;

namespace Mjolksyra.UseCases.Trainees.UpdateTrianeeCost;

public class UpdateTraineeCostCommandHandler : IRequestHandler<UpdateTraineeCostCommand>
{
    private readonly ITraineeRepository _traineeRepository;

    private readonly IUserRepository _userRepository;

    private readonly IStripeClient _stripeClient;
    private readonly IEmailSender _emailSender;
    private readonly INotificationService _notificationService;

    public UpdateTraineeCostCommandHandler(
        ITraineeRepository traineeRepository,
        IUserRepository userRepository,
        IStripeClient stripeClient,
        IEmailSender emailSender,
        INotificationService notificationService)
    {
        _traineeRepository = traineeRepository;
        _userRepository = userRepository;
        _stripeClient = stripeClient;
        _emailSender = emailSender;
        _notificationService = notificationService;
    }

    public async Task Handle(UpdateTraineeCostCommand request, CancellationToken cancellationToken)
    {
        var trainee = await _traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee?.CoachUserId != request.UserId) return;

        trainee.Cost.Amount = request.Amount;

        var athlete = await _userRepository.GetById(trainee.AthleteUserId, cancellationToken);
        var coach = await _userRepository.GetById(trainee.CoachUserId, cancellationToken);

        if (athlete is { IsAthlete: true, Athlete.Stripe.CustomerId: not null, Athlete.Stripe.PaymentMethodId: not null }
            && coach is { IsCoach: true, Coach.Stripe.AccountId: not null })
        {
            var subscriptionService = new SubscriptionService(_stripeClient);

            if (trainee.StripeSubscriptionId is not null)
            {
                await subscriptionService.CancelAsync(trainee.StripeSubscriptionId, cancellationToken: cancellationToken);
            }

            var priceService = new PriceService(_stripeClient);
            var price = await priceService.CreateAsync(new PriceCreateOptions
            {
                Currency = trainee.Cost.Currency.ToLowerInvariant(),
                UnitAmount = trainee.Cost.Amount * 100L,
                Recurring = new PriceRecurringOptions
                {
                    Interval = "month",
                },
                ProductData = new PriceProductDataOptions
                {
                    Name = "Coaching subscription",
                },
            }, cancellationToken: cancellationToken);

            var subscription = await subscriptionService.CreateAsync(new SubscriptionCreateOptions
            {
                Customer = athlete.Athlete!.Stripe!.CustomerId,
                DefaultPaymentMethod = athlete.Athlete.Stripe.PaymentMethodId,
                OnBehalfOf = coach.Coach!.Stripe!.AccountId,
                Items =
                [
                    new SubscriptionItemOptions
                    {
                        Price = price.Id,
                    }
                ],
                TransferData = new SubscriptionTransferDataOptions
                {
                    Destination = coach.Coach.Stripe.AccountId,
                }
            }, cancellationToken: cancellationToken);

            trainee.StripeSubscriptionId = subscription.Id;
        }

        await _traineeRepository.Update(trainee, cancellationToken);

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
