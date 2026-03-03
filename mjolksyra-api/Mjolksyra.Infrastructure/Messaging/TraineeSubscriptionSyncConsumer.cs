using MassTransit;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Messaging;
using Stripe;

namespace Mjolksyra.Infrastructure.Messaging;

public class TraineeSubscriptionSyncConsumer(
    ITraineeRepository traineeRepository,
    IUserRepository userRepository,
    IStripeClient stripeClient)
    : IConsumer<TraineeSubscriptionSyncMessage>
{
    public async Task Consume(ConsumeContext<TraineeSubscriptionSyncMessage> context)
    {
        var message = context.Message;
        var cancellationToken = context.CancellationToken;

        var trainee = await traineeRepository.GetById(message.TraineeId, cancellationToken);
        if (trainee is null)
        {
            return;
        }

        var athlete = await userRepository.GetById(trainee.AthleteUserId, cancellationToken);
        var coach = await userRepository.GetById(trainee.CoachUserId, cancellationToken);

        if (athlete is not { IsAthlete: true, Athlete.Stripe.CustomerId: not null, Athlete.Stripe.PaymentMethodId: not null }
            || coach is not { IsCoach: true, Coach.Stripe.AccountId: not null })
        {
            return;
        }

        var subscriptionService = new SubscriptionService(stripeClient);
        var priceService = new PriceService(stripeClient);
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

        if (trainee.StripeSubscriptionId is not null
            && message.BillingMode == TraineeSubscriptionSyncBillingMode.NextCycle)
        {
            var existingSubscription = await subscriptionService.GetAsync(
                trainee.StripeSubscriptionId,
                new SubscriptionGetOptions
                {
                    Expand = ["items.data"]
                },
                cancellationToken: cancellationToken);

            var currentItem = existingSubscription.Items.Data.FirstOrDefault();
            if (currentItem is null)
            {
                return;
            }

            await subscriptionService.UpdateAsync(
                trainee.StripeSubscriptionId,
                new SubscriptionUpdateOptions
                {
                    ProrationBehavior = "none",
                    Items =
                    [
                        new SubscriptionItemOptions
                        {
                            Id = currentItem.Id,
                            Price = price.Id,
                        }
                    ]
                },
                cancellationToken: cancellationToken);
            return;
        }

        if (trainee.StripeSubscriptionId is not null)
        {
            await subscriptionService.CancelAsync(trainee.StripeSubscriptionId, cancellationToken: cancellationToken);
        }

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
        await traineeRepository.Update(trainee, cancellationToken);
    }
}
