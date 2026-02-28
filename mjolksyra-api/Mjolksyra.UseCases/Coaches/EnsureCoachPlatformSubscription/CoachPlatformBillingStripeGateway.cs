using System.Net;
using Stripe;

namespace Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;

public sealed class CoachPlatformBillingStripeGateway : ICoachPlatformBillingStripeGateway
{
    private const long MonthlyAmountOre = 39900;
    private const string Currency = "sek";
    private const string ProductName = "Mjolksyra Coach Subscription";

    private readonly IStripeClient _stripeClient;

    public CoachPlatformBillingStripeGateway(IStripeClient stripeClient)
    {
        _stripeClient = stripeClient;
    }

    public async Task<bool> HasActiveSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken)
    {
        var subscriptionService = new SubscriptionService(_stripeClient);

        try
        {
            var subscription = await subscriptionService.GetAsync(subscriptionId, cancellationToken: cancellationToken);
            return subscription.Status is "trialing" or "active" or "past_due" or "unpaid" or "incomplete";
        }
        catch (StripeException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound)
        {
            return false;
        }
    }

    public async Task<string> CreateCustomerAsync(
        Guid userId,
        string email,
        string? givenName,
        string? familyName,
        CancellationToken cancellationToken)
    {
        var customerService = new CustomerService(_stripeClient);
        var customer = await customerService.CreateAsync(
            new CustomerCreateOptions
            {
                Email = email,
                Name = string.Join(" ", new[] { givenName, familyName }.Where(x => !string.IsNullOrWhiteSpace(x))),
                Metadata = new Dictionary<string, string>
                {
                    ["UserId"] = userId.ToString(),
                    ["Type"] = "coach-platform-customer"
                }
            },
            requestOptions: new RequestOptions
            {
                IdempotencyKey = $"coach-customer-{userId}"
            },
            cancellationToken: cancellationToken);

        return customer.Id;
    }

    public async Task<string> CreateSubscriptionAsync(
        Guid userId,
        string customerId,
        CancellationToken cancellationToken)
    {
        var priceService = new PriceService(_stripeClient);
        var price = await priceService.CreateAsync(
            new PriceCreateOptions
            {
                Currency = Currency,
                UnitAmount = MonthlyAmountOre,
                Recurring = new PriceRecurringOptions
                {
                    Interval = "month"
                },
                ProductData = new PriceProductDataOptions
                {
                    Name = ProductName,
                    Metadata = new Dictionary<string, string>
                    {
                        ["Type"] = "coach-platform-subscription"
                    }
                },
                Metadata = new Dictionary<string, string>
                {
                    ["UserId"] = userId.ToString(),
                    ["Type"] = "coach-platform-subscription-price"
                }
            },
            requestOptions: new RequestOptions
            {
                IdempotencyKey = $"coach-sub-price-{userId}-{DateTime.UtcNow:yyyyMM}"
            },
            cancellationToken: cancellationToken);

        var subscriptionService = new SubscriptionService(_stripeClient);
        var subscription = await subscriptionService.CreateAsync(
            new SubscriptionCreateOptions
            {
                Customer = customerId,
                CollectionMethod = "charge_automatically",
                PaymentBehavior = "allow_incomplete",
                Items =
                [
                    new SubscriptionItemOptions
                    {
                        Price = price.Id
                    }
                ],
                Metadata = new Dictionary<string, string>
                {
                    ["UserId"] = userId.ToString(),
                    ["Type"] = "coach-platform-subscription"
                },
                Expand = ["latest_invoice.payment_intent"]
            },
            requestOptions: new RequestOptions
            {
                IdempotencyKey = $"coach-subscription-{userId}-{DateTime.UtcNow:yyyyMM}"
            },
            cancellationToken: cancellationToken);

        return subscription.Id;
    }
}
