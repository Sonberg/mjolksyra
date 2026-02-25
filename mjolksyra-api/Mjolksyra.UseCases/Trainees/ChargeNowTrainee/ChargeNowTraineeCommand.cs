using MediatR;

namespace Mjolksyra.UseCases.Trainees.ChargeNowTrainee;

public class ChargeNowTraineeCommand : IRequest
{
    public Guid TraineeId { get; set; }

    public Guid UserId { get; set; }
}
