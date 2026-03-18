using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.ReplaceMediaUrl;

public class ReplaceMediaUrlCommand : IRequest
{
    public required Guid TraineeId { get; set; }
    public required Guid PlannedWorkoutId { get; set; }
    public required string OldUrl { get; set; }
    public required string NewUrl { get; set; }
}
