using Stripe;

namespace Mjolksyra.UseCases.Coaches.PurchaseAiCreditPack;

public sealed class StripeAiCreditPackGateway(IStripeClient stripeClient) : IStripeAiCreditPackGateway
{
    private const string Currency = "sek";

    public async Task<string> CreateAndPayInvoiceAsync(
        string customerId,
        int amountOre,
        Guid packId,
        Guid coachUserId,
        CancellationToken ct)
    {
        var invoiceService = new InvoiceService(stripeClient);
        var invoiceItemService = new InvoiceItemService(stripeClient);

        var invoice = await invoiceService.CreateAsync(
            new InvoiceCreateOptions
            {
                Customer = customerId,
                CollectionMethod = "charge_automatically",
                AutoAdvance = false,
                Metadata = new Dictionary<string, string>
                {
                    ["type"] = "ai-credit-pack",
                    ["packId"] = packId.ToString(),
                    ["coachUserId"] = coachUserId.ToString(),
                },
            },
            requestOptions: new RequestOptions
            {
                IdempotencyKey = $"ai-credit-pack-invoice-{coachUserId}-{packId}-{DateTime.UtcNow:yyyyMMddHH}"
            },
            cancellationToken: ct);

        await invoiceItemService.CreateAsync(
            new InvoiceItemCreateOptions
            {
                Customer = customerId,
                Invoice = invoice.Id,
                Amount = amountOre,
                Currency = Currency,
                Description = $"AI Credit Pack ({packId})",
            },
            cancellationToken: ct);

        await invoiceService.FinalizeInvoiceAsync(invoice.Id, cancellationToken: ct);

        var paid = await invoiceService.PayAsync(invoice.Id, cancellationToken: ct);
        return paid.Id;
    }
}
