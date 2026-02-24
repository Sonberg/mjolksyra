namespace Mjolksyra.UseCases.Trainees;

public enum TraineeBillingStatus
{
    PriceNotSet,
    AwaitingAthletePaymentMethod,
    AwaitingCoachStripeSetup,
    SubscriptionActive,
    PriceSet
}
