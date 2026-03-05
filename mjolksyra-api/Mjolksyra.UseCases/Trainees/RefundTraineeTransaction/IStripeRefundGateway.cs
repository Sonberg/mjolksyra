namespace Mjolksyra.UseCases.Trainees.RefundTraineeTransaction;

public interface IStripeRefundGateway
{
    /// <summary>
    /// Resolves the PaymentIntent ID from an Invoice ID, then creates a refund
    /// that also reverses the Connect transfer to the coach's account.
    /// </summary>
    Task RefundInvoiceAsync(string invoiceId, CancellationToken cancellationToken = default);
}
