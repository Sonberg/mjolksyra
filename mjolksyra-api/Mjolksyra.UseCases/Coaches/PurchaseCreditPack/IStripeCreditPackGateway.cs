namespace Mjolksyra.UseCases.Coaches.PurchaseCreditPack;

public interface IStripeCreditPackGateway
{
    Task CreateAndPayInvoiceAsync(
        string customerId,
        long amountOre,
        Guid packId,
        Guid coachUserId,
        CancellationToken cancellationToken);
}
