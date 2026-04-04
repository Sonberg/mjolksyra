using Stripe;

namespace Mjolksyra.UseCases.Coaches.PurchaseCreditPack;

public class StripeCreditPackGateway(IStripeClient stripeClient) : IStripeCreditPackGateway
{
    public async Task CreateAndPayInvoiceAsync(
        string customerId,
        long amountOre,
        Guid packId,
        Guid coachUserId,
        CancellationToken cancellationToken)
    {
        var invoiceItemService = new InvoiceItemService(stripeClient);
        var invoiceService = new InvoiceService(stripeClient);

        await invoiceItemService.CreateAsync(new InvoiceItemCreateOptions
        {
            Customer = customerId,
            Currency = "sek",
            UnitAmount = amountOre,
            Description = "Mjolksyra credits purchase",
            Metadata = new Dictionary<string, string>
            {
                ["type"] = "credits-pack",
                ["packId"] = packId.ToString(),
                ["coachUserId"] = coachUserId.ToString(),
            },
        }, cancellationToken: cancellationToken);

        var invoice = await invoiceService.CreateAsync(new InvoiceCreateOptions
        {
            Customer = customerId,
            AutoAdvance = true,
            CollectionMethod = "charge_automatically",
            Metadata = new Dictionary<string, string>
            {
                ["type"] = "credits-pack",
                ["packId"] = packId.ToString(),
                ["coachUserId"] = coachUserId.ToString(),
            },
        }, cancellationToken: cancellationToken);

        await invoiceService.FinalizeInvoiceAsync(invoice.Id, cancellationToken: cancellationToken);
    }
}
