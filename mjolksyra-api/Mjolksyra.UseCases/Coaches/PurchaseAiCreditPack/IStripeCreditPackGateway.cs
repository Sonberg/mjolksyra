namespace Mjolksyra.UseCases.Coaches.PurchaseCreditPack;

public interface IStripeCreditPackGateway
{
    Task<string> CreateAndPayInvoiceAsync(
        string customerId,
        int amountOre,
        Guid packId,
        Guid coachUserId,
        CancellationToken ct);
}
