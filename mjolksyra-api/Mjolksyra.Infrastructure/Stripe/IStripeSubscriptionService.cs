using Stripe;

namespace Mjolksyra.Infrastructure.Stripe;

public interface IStripeSubscriptionService
{
    Task<Subscription> GetAsync(string id, SubscriptionGetOptions options, CancellationToken cancellationToken = default);

    Task<Subscription> UpdateAsync(string id, SubscriptionUpdateOptions options, CancellationToken cancellationToken = default);

    Task<Subscription> CancelAsync(string id, CancellationToken cancellationToken = default);

    Task<Subscription> CreateAsync(SubscriptionCreateOptions options, CancellationToken cancellationToken = default);
}
