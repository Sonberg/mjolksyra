namespace Mjolksyra.Domain.Messaging;

public record MediaCompressionRequestedMessage
{
    public required string FileUrl { get; init; }
    public required Guid PlannedWorkoutId { get; init; }

    public required Guid PlannedWorkoutChatMessageId { get; init; }
}
