using Stripe;

namespace Mjolksyra.Infrastructure.Stripe;

public interface IStripeRefundService
{
    Task<Refund> CreateAsync(RefundCreateOptions options, CancellationToken cancellationToken = default);
}
