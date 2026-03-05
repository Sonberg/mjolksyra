using Stripe;

namespace Mjolksyra.Infrastructure.Stripe;

public interface IStripeInvoiceService
{
    Task<Invoice> GetAsync(string id, CancellationToken cancellationToken = default);
}
