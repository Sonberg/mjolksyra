using Stripe;

namespace Mjolksyra.Infrastructure.Stripe;

public interface IStripePriceService
{
    Task<Price> CreateAsync(PriceCreateOptions options, CancellationToken cancellationToken = default);
}
