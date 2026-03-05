using MediatR;

namespace Mjolksyra.UseCases.Trainees.RefundTraineeTransaction;

public class RefundTraineeTransactionCommand : IRequest
{
    public required Guid TraineeId { get; set; }

    public required Guid TransactionId { get; set; }

    public required Guid UserId { get; set; }
}
