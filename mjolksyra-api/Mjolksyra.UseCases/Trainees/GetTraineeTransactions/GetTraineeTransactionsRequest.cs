using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Trainees.GetTraineeTransactions;

public class GetTraineeTransactionsRequest : IRequest<ICollection<TraineeTransactionResponse>?>
{
    public required Guid TraineeId { get; set; }
}

public class GetTraineeTransactionsRequestHandler(
    ITraineeRepository traineeRepository,
    ITraineeTransactionRepository transactionRepository)
    : IRequestHandler<GetTraineeTransactionsRequest, ICollection<TraineeTransactionResponse>?>
{
    public async Task<ICollection<TraineeTransactionResponse>?> Handle(
        GetTraineeTransactionsRequest request, CancellationToken cancellationToken)
    {
        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null) return null;

        var transactions = await transactionRepository.GetByTraineeId(request.TraineeId, cancellationToken);

        return transactions
            .Select(t => new TraineeTransactionResponse
            {
                Id = t.Id,
                Status = t.Status.ToString(),
                Amount = t.Cost.Total,
                Currency = t.Cost.Currency,
                CreatedAt = t.CreatedAt,
                ReceiptUrl = t.ReceiptUrl
            })
            .ToList();
    }
}
