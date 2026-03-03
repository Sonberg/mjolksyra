using MassTransit;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.Stripe;
using Stripe;

namespace Mjolksyra.Infrastructure.Messaging;

public class TraineeSubscriptionSyncConsumer(
    ITraineeRepository traineeRepository,
    IUserRepository userRepository,
    IStripePriceService priceService,
    IStripeSubscriptionService subscriptionService)
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

        if (trainee.StripeSubscriptionId is not null
            && message.BillingMode == TraineeSubscriptionSyncBillingMode.NextCycle)
        {
            var existingSubscription = await subscriptionService.GetAsync(
                trainee.StripeSubscriptionId,
                new SubscriptionGetOptions
                {
                    Expand = ["items.data"]
                },
                cancellationToken);

            var currentItem = existingSubscription.Items.Data.FirstOrDefault();
            if (currentItem is null)
            {
                return;
            }

            var nextCyclePrice = await priceService.CreateAsync(BuildPriceOptions(trainee.Cost), cancellationToken);

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
                            Price = nextCyclePrice.Id,
                        }
                    ]
                },
                cancellationToken);
            return;
        }

        if (trainee.StripeSubscriptionId is not null)
        {
            await subscriptionService.CancelAsync(trainee.StripeSubscriptionId, cancellationToken);
        }

        var price = await priceService.CreateAsync(BuildPriceOptions(trainee.Cost), cancellationToken);

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
        }, cancellationToken);

        trainee.StripeSubscriptionId = subscription.Id;
        await traineeRepository.Update(trainee, cancellationToken);
    }

    private static PriceCreateOptions BuildPriceOptions(Domain.Database.Models.TraineeCost cost) =>
        new()
        {
            Currency = cost.Currency.ToLowerInvariant(),
            UnitAmount = cost.Amount * 100L,
            Recurring = new PriceRecurringOptions
            {
                Interval = "month",
            },
            ProductData = new PriceProductDataOptions
            {
                Name = "Coaching subscription",
            },
        };
}
