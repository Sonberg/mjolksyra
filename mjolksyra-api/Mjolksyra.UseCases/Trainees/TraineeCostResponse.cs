using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Trainees;

public class TraineeCostResponse
{
    public required int Total { get; init; }

    public required string Currency { get; set; }

    public static TraineeCostResponse From(TraineeTransactionCost cost)
    {
        return new TraineeCostResponse
        {
            Total = cost.Total,
            Currency = cost.Currency
        };
    }
}