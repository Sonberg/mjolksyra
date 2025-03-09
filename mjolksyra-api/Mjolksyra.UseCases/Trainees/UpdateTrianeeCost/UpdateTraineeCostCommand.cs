using MediatR;

namespace Mjolksyra.UseCases.Trainees.UpdateTrianeeCost;

public record UpdateTraineeCostRequest
{
    public int Amount { get; set; }

    public UpdateTraineeCostCommand ToCommand(Guid traineeId, Guid userId)
    {
        return new UpdateTraineeCostCommand
        {
            Amount = Amount,
            TraineeId = traineeId,
            UserId = userId
        };
    }
}

public record UpdateTraineeCostCommand : UpdateTraineeCostRequest, IRequest
{
    public Guid TraineeId { get; set; }

    public Guid UserId { get; set; }
}