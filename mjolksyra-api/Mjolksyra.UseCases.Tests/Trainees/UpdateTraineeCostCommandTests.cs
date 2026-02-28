using Mjolksyra.UseCases.Trainees.UpdateTrianeeCost;

namespace Mjolksyra.UseCases.Tests.Trainees;

public class UpdateTraineeCostCommandTests
{
    [Fact]
    public void ToCommand_UsesChargeNowByDefault()
    {
        var request = new UpdateTraineeCostRequest
        {
            Amount = 1200
        };

        var command = request.ToCommand(Guid.NewGuid(), Guid.NewGuid());

        Assert.Equal(PriceChangeBillingMode.ChargeNow, command.BillingMode);
    }

    [Fact]
    public void ToCommand_MapsBillingMode()
    {
        var request = new UpdateTraineeCostRequest
        {
            Amount = 1200,
            BillingMode = PriceChangeBillingMode.NextCycle
        };

        var command = request.ToCommand(Guid.NewGuid(), Guid.NewGuid());

        Assert.Equal(PriceChangeBillingMode.NextCycle, command.BillingMode);
    }
}
