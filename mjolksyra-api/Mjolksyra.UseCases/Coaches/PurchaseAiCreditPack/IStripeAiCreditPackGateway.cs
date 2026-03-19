namespace Mjolksyra.UseCases.Coaches.PurchaseAiCreditPack;

public interface IStripeAiCreditPackGateway
{
    Task<string> CreateAndPayInvoiceAsync(
        string customerId,
        int amountOre,
        Guid packId,
        Guid coachUserId,
        CancellationToken ct);
}
