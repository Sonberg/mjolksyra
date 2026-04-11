namespace Mjolksyra.Domain.Messaging;

public record MediaCompressionRequestedMessage
{
    public required string FileUrl { get; init; }
    public required Guid CompletedWorkoutId { get; init; }

    public required Guid CompletedWorkoutChatMessageId { get; init; }
}
