using Stripe;

namespace Mjolksyra.Infrastructure.Stripe;

public class StripeSubscriptionServiceAdapter(IStripeClient stripeClient) : IStripeSubscriptionService
{
    private readonly SubscriptionService _subscriptionService = new(stripeClient);

    public Task<Subscription> GetAsync(string id, SubscriptionGetOptions options, CancellationToken cancellationToken = default)
        => _subscriptionService.GetAsync(id, options, cancellationToken: cancellationToken);

    public Task<Subscription> UpdateAsync(string id, SubscriptionUpdateOptions options, CancellationToken cancellationToken = default)
        => _subscriptionService.UpdateAsync(id, options, cancellationToken: cancellationToken);

    public Task<Subscription> CancelAsync(string id, CancellationToken cancellationToken = default)
        => _subscriptionService.CancelAsync(id, cancellationToken: cancellationToken);

    public Task<Subscription> CreateAsync(SubscriptionCreateOptions options, CancellationToken cancellationToken = default)
        => _subscriptionService.CreateAsync(options, cancellationToken: cancellationToken);
}
