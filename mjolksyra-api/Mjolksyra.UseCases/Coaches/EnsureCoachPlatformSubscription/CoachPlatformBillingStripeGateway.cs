using System.Net;
using Stripe;

namespace Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;

public sealed class CoachPlatformBillingStripeGateway : ICoachPlatformBillingStripeGateway
{
    private const long MonthlyAmountOre = 39900;
    private const long OverageAmountOre = 3900;
    private const string Currency = "sek";
    private const string ProductName = "Mjolksyra Coach Subscription";
    private const string OverageProductName = "Mjolksyra Coach Overage";

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
        int overageQuantity,
        CancellationToken cancellationToken)
    {
        var basePrice = await CreateMonthlyPriceAsync(
            userId,
            ProductName,
            MonthlyAmountOre,
            "coach-platform-subscription",
            "coach-platform-subscription-price",
            $"coach-sub-price-{userId}-{DateTime.UtcNow:yyyyMM}",
            cancellationToken);
        var overagePrice = await CreateMonthlyPriceAsync(
            userId,
            OverageProductName,
            OverageAmountOre,
            "coach-platform-overage",
            "coach-platform-overage-price",
            $"coach-overage-price-{userId}-{DateTime.UtcNow:yyyyMM}",
            cancellationToken);

        var subscriptionService = new SubscriptionService(_stripeClient);
        var effectiveOverageQuantity = Math.Max(0, overageQuantity);
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
                        Price = basePrice.Id,
                        Metadata = new Dictionary<string, string>
                        {
                            ["Type"] = "coach-platform-base"
                        },
                        Quantity = 1
                    },
                    new SubscriptionItemOptions
                    {
                        Price = overagePrice.Id,
                        Metadata = new Dictionary<string, string>
                        {
                            ["Type"] = "coach-platform-overage"
                        },
                        Quantity = effectiveOverageQuantity
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

    public async Task SyncOverageQuantityAsync(
        Guid userId,
        string subscriptionId,
        int overageQuantity,
        CancellationToken cancellationToken)
    {
        var subscriptionService = new SubscriptionService(_stripeClient);
        var subscription = await subscriptionService.GetAsync(
            subscriptionId,
            new SubscriptionGetOptions
            {
                Expand = ["items.data.price"]
            },
            cancellationToken: cancellationToken);

        var effectiveOverageQuantity = Math.Max(0, overageQuantity);
        var overageItem = subscription.Items.Data.FirstOrDefault(item =>
            item.Metadata is not null
            && item.Metadata.TryGetValue("Type", out var type)
            && type == "coach-platform-overage");

        if (overageItem is not null)
        {
            var itemService = new SubscriptionItemService(_stripeClient);
            await itemService.UpdateAsync(
                overageItem.Id,
                new SubscriptionItemUpdateOptions
                {
                    Quantity = effectiveOverageQuantity
                },
                new RequestOptions
                {
                    IdempotencyKey = $"coach-overage-item-{userId}-{subscriptionId}-{effectiveOverageQuantity}"
                },
                cancellationToken);
            return;
        }

        var overagePrice = await CreateMonthlyPriceAsync(
            userId,
            OverageProductName,
            OverageAmountOre,
            "coach-platform-overage",
            "coach-platform-overage-price",
            $"coach-overage-price-{userId}-{DateTime.UtcNow:yyyyMM}",
            cancellationToken);

        var itemCreateService = new SubscriptionItemService(_stripeClient);
        await itemCreateService.CreateAsync(
            new SubscriptionItemCreateOptions
            {
                Subscription = subscriptionId,
                Price = overagePrice.Id,
                Quantity = effectiveOverageQuantity,
                Metadata = new Dictionary<string, string>
                {
                    ["Type"] = "coach-platform-overage"
                }
            },
            new RequestOptions
            {
                IdempotencyKey = $"coach-overage-create-{userId}-{subscriptionId}-{effectiveOverageQuantity}"
            },
            cancellationToken);
    }

    private async Task<Price> CreateMonthlyPriceAsync(
        Guid userId,
        string productName,
        long amountOre,
        string productType,
        string priceType,
        string idempotencyKey,
        CancellationToken cancellationToken)
    {
        var priceService = new PriceService(_stripeClient);
        return await priceService.CreateAsync(
            new PriceCreateOptions
            {
                Currency = Currency,
                UnitAmount = amountOre,
                Recurring = new PriceRecurringOptions
                {
                    Interval = "month"
                },
                ProductData = new PriceProductDataOptions
                {
                    Name = productName,
                    Metadata = new Dictionary<string, string>
                    {
                        ["Type"] = productType
                    }
                },
                Metadata = new Dictionary<string, string>
                {
                    ["UserId"] = userId.ToString(),
                    ["Type"] = priceType
                }
            },
            requestOptions: new RequestOptions
            {
                IdempotencyKey = idempotencyKey
            },
            cancellationToken: cancellationToken);
    }
}
