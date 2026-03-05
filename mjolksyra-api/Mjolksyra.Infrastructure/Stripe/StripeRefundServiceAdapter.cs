using Stripe;

namespace Mjolksyra.Infrastructure.Stripe;

public class StripeRefundServiceAdapter(IStripeClient stripeClient) : IStripeRefundService
{
    private readonly RefundService _refundService = new(stripeClient);

    public Task<Refund> CreateAsync(RefundCreateOptions options, CancellationToken cancellationToken = default)
        => _refundService.CreateAsync(options, cancellationToken: cancellationToken);
}
