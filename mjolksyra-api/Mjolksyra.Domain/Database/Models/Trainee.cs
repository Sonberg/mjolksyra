namespace Mjolksyra.Domain.Database.Models;

public class Trainee
{
    public Guid Id { get; set; }

    public Guid CoachUserId { get; set; }

    public Guid AthleteUserId { get; set; }

    public required TraineeStatus Status { get; set; }

    public TraineeCost Cost { get; set; } = new();

    public ICollection<TraineeTransaction> Transactions { get; set; } = [];

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }
}

public class TraineeCost
{
    public int Amount { get; set; }

    public string Currency => "SEK";
}

public class TraineeTransaction
{
    public Guid Id { get; set; }

    public required string PaymentIntentId { get; set; }

    public required TraineeTransactionStatus Status { get; set; }

    public string? StatusRaw { get; set; }

    public required TraineeTransactionCost Cost { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}

public class TraineeTransactionCost
{
    public int ApplicationFee { get; init; }

    public int Coach { get; init; }

    public int Total { get; init; }

    public static TraineeTransactionCost From(TraineeCost cost)
    {
        var applicationFee = Math.Min(50, Convert.ToInt32(cost.Amount * 0.1));
        var coach = Math.Max(0, cost.Amount - applicationFee);

        return new TraineeTransactionCost
        {
            ApplicationFee = applicationFee,
            Coach = Math.Max(0, cost.Amount - applicationFee),
            Total = applicationFee + coach
        };
    }
}

public enum TraineeTransactionStatus
{
    Pending,
    Succeeded,
    Failed
}

public enum TraineeStatus
{
    Active,
    Cancelled
}