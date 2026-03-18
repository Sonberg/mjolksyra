namespace Mjolksyra.Domain.Messaging;

public record MediaCompressionRequestedMessage
{
    public required string FileUrl { get; init; }
    public required Guid TraineeId { get; init; }
    public required Guid PlannedWorkoutId { get; init; }
}
