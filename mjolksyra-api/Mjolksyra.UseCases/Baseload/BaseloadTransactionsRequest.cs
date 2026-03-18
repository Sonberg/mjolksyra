using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Stripe;

namespace Mjolksyra.UseCases.Baseload;

public interface IStripeInvoiceListGateway
{
    Task<IReadOnlyList<Invoice>> ListAllAsync(CancellationToken cancellationToken = default);
}

public class StripeInvoiceListGateway(IStripeClient stripeClient) : IStripeInvoiceListGateway
{
    private readonly InvoiceService _invoiceService = new(stripeClient);

    public async Task<IReadOnlyList<Invoice>> ListAllAsync(CancellationToken cancellationToken = default)
    {
        var invoices = new List<Invoice>();
        await foreach (var invoice in _invoiceService.ListAutoPagingAsync(new InvoiceListOptions { Limit = 100 }, cancellationToken: cancellationToken))
        {
            invoices.Add(invoice);
        }
        return invoices;
    }
}

public class BaseloadTransactionsRequest : IRequest<BaseloadTransactionsResponse>
{
}

public class BaseloadTransactionsResponse
{
    public int Processed { get; set; }
}

public class BaseloadTransactionsRequestHandler(
    IStripeInvoiceListGateway stripeInvoiceListGateway,
    ITraineeRepository traineeRepository,
    ITraineeTransactionRepository transactionRepository)
    : IRequestHandler<BaseloadTransactionsRequest, BaseloadTransactionsResponse>
{
    public async Task<BaseloadTransactionsResponse> Handle(
        BaseloadTransactionsRequest request, CancellationToken cancellationToken)
    {
        var invoices = await stripeInvoiceListGateway.ListAllAsync(cancellationToken);
        var processed = 0;

        foreach (var invoice in invoices)
        {
            if (invoice.SubscriptionId is null) continue;

            var trainee = await traineeRepository.GetBySubscriptionId(invoice.SubscriptionId, cancellationToken);
            if (trainee is null) continue;

            var status = invoice.Status == "paid"
                ? TraineeTransactionStatus.Succeeded
                : TraineeTransactionStatus.Failed;

            var transaction = new TraineeTransaction
            {
                Id = Guid.NewGuid(),
                TraineeId = trainee.Id,
                PaymentIntentId = invoice.Id,
                Cost = new TraineeTransactionCost
                {
                    Total = (int)(invoice.AmountPaid / 100),
                    Currency = invoice.Currency?.ToUpperInvariant() ?? trainee.Cost.Currency
                },
                Status = status,
                StatusRaw = invoice.Status,
                CreatedAt = invoice.Created,
            };

            await transactionRepository.Upsert(transaction, cancellationToken);
            processed++;
        }

        return new BaseloadTransactionsResponse { Processed = processed };
    }
}
