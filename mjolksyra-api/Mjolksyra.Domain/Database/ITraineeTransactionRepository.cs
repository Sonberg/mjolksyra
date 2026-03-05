using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface ITraineeTransactionRepository
{
    Task<ICollection<TraineeTransaction>> GetByTraineeId(Guid traineeId, CancellationToken ct);

    Task<ICollection<TraineeTransaction>> GetAllAsync(CancellationToken ct);

    Task<TraineeTransaction?> GetById(Guid id, CancellationToken ct);

    Task<TraineeTransaction?> GetByPaymentIntentId(string paymentIntentId, CancellationToken ct);

    Task Upsert(TraineeTransaction transaction, CancellationToken ct);

    Task<decimal> TotalRevenueAsync(CancellationToken ct);
}
