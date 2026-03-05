using Stripe;

namespace Mjolksyra.UseCases.Trainees.RefundTraineeTransaction;

public sealed class StripeRefundGateway(IStripeClient stripeClient) : IStripeRefundGateway
{
    public async Task RefundInvoiceAsync(string invoiceId, CancellationToken cancellationToken = default)
    {
        var invoiceService = new InvoiceService(stripeClient);
        var invoice = await invoiceService.GetAsync(invoiceId, cancellationToken: cancellationToken);

        var refundService = new RefundService(stripeClient);
        await refundService.CreateAsync(new RefundCreateOptions
        {
            PaymentIntent = invoice.PaymentIntentId,
            ReverseTransfer = true
        }, cancellationToken: cancellationToken);
    }
}
