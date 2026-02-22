using MediatR;

namespace Mjolksyra.UseCases.Blocks.ApplyBlock;

public class ApplyBlockCommand : IRequest
{
    public Guid BlockId { get; set; }

    public Guid TraineeId { get; set; }

    /// <summary>Must be a Monday. Block workouts are placed starting from this date.</summary>
    public DateOnly StartDate { get; set; }
}
