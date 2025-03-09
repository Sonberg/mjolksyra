namespace Mjolksyra.Domain.Database.Models;

public class TraineeTransactionCost
{
    public int ApplicationFee { get; init; }

    public int Coach { get; init; }

    public int Total { get; init; }

    public static TraineeTransactionCost From(TraineeCost cost)
    {
        var applicationFee = Math.Max(50, Convert.ToInt32(cost.Amount * 0.1));
        var coach = Math.Max(0, cost.Amount - applicationFee);

        return new TraineeTransactionCost
        {
            ApplicationFee = applicationFee,
            Coach = Math.Max(0, cost.Amount - applicationFee),
            Total = applicationFee + coach
        };
    }
}