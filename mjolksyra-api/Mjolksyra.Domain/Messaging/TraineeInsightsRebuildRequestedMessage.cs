namespace Mjolksyra.Domain.Messaging;

public record TraineeInsightsRebuildRequestedMessage(
    Guid TraineeId,
    Guid CoachUserId,
    bool IsManual,
    DateTimeOffset RequestedAt,
    int IncludedReserved = 0,
    int PurchasedReserved = 0);
