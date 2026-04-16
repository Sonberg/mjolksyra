namespace Mjolksyra.Domain.Messaging;

public record CoachInsightsRebuildRequestedMessage(
    Guid CoachUserId,
    DateTimeOffset RequestedAt);
