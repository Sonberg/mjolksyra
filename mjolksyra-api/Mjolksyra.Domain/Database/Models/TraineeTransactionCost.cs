namespace Mjolksyra.Domain.Database.Models;

public class TraineeTransactionCost
{
    public int Total { get; init; }
    
    public string Currency { get; init; }

    public static TraineeTransactionCost From(TraineeCost cost)
    {
        return new TraineeTransactionCost
        {
            Total = cost.Amount,
            Currency = cost.Currency
        };
    }
}