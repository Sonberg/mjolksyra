using Stripe;

namespace Mjolksyra.Infrastructure.Stripe;

public class StripePriceServiceAdapter(IStripeClient stripeClient) : IStripePriceService
{
    private readonly PriceService _priceService = new(stripeClient);

    public Task<Price> CreateAsync(PriceCreateOptions options, CancellationToken cancellationToken = default)
        => _priceService.CreateAsync(options, cancellationToken: cancellationToken);
}
