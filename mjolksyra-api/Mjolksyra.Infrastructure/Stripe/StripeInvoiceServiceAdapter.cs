using Stripe;

namespace Mjolksyra.Infrastructure.Stripe;

public class StripeInvoiceServiceAdapter(IStripeClient stripeClient) : IStripeInvoiceService
{
    private readonly InvoiceService _invoiceService = new(stripeClient);

    public Task<Invoice> GetAsync(string id, CancellationToken cancellationToken = default)
        => _invoiceService.GetAsync(id, cancellationToken: cancellationToken);
}
