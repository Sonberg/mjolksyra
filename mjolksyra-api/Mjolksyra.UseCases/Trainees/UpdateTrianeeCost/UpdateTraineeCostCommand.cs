using MediatR;

namespace Mjolksyra.UseCases.Trainees.UpdateTrianeeCost;

public enum PriceChangeBillingMode
{
    ChargeNow = 0,
    NextCycle = 1
}

public record UpdateTraineeCostRequest
{
    public int Amount { get; set; }
    
    public PriceChangeBillingMode BillingMode { get; set; } = PriceChangeBillingMode.ChargeNow;

    public UpdateTraineeCostCommand ToCommand(Guid traineeId, Guid userId)
    {
        return new UpdateTraineeCostCommand
        {
            Amount = Amount,
            BillingMode = BillingMode,
            TraineeId = traineeId,
            UserId = userId
        };
    }
}

public record UpdateTraineeCostCommand : UpdateTraineeCostRequest, IRequest
{
    public Guid TraineeId { get; set; }

    public Guid UserId { get; set; }

    public bool SuppressPriceChangedNotification { get; set; }
}
