using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Tests;

public class TraineeTransactionCostTests
{
    [Fact]
    [Trait(nameof(TraineeTransactionCost), nameof(Free_ApplicationFeeOnly))]
    public async Task Free_ApplicationFeeOnly()
    {
        await Verify(TraineeTransactionCost.From(new TraineeCost
        {
            Amount = 0
        }));
    }

    [Fact]
    [Trait(nameof(TraineeTransactionCost), nameof(LowCost))]
    public async Task LowCost()
    {
        await Verify(TraineeTransactionCost.From(new TraineeCost
        {
            Amount = 100
        }));
    }

    [Fact]
    [Trait(nameof(TraineeTransactionCost), nameof(HighCost))]
    public async Task HighCost()
    {
        await Verify(TraineeTransactionCost.From(new TraineeCost
        {
            Amount = 1000
        }));
    }
}