namespace Mjolksyra.Domain.Database.Models;

public class TraineeTransaction
{
    public Guid Id { get; set; }

    public required string PaymentIntentId { get; set; }

    public required TraineeTransactionStatus Status { get; set; }

    public string? StatusRaw { get; set; }

    public required TraineeTransactionCost Cost { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}