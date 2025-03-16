using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Trainees;

public class TraineeCostResponse
{
    public required int ApplicationFee { get; init; }

    public required int Coach { get; init; }

    public required int Total { get; init; }

    public required string Curreny { get; set; }

    public static TraineeCostResponse From(TraineeTransactionCost cost)
    {
        return new TraineeCostResponse
        {
            ApplicationFee = cost.ApplicationFee,
            Coach = cost.Coach,
            Total = cost.Total,
            Curreny = cost.Currency
        };
    }
}