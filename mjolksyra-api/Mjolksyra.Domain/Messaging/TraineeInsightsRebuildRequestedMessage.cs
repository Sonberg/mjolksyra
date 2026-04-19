namespace Mjolksyra.Domain.Messaging;

public record TraineeInsightsRebuildRequestedMessage(
    Guid TraineeId,
    Guid CoachUserId,
    bool IsManual,
    DateTimeOffset RequestedAt,
    string AthleteName = "",
    int IncludedReserved = 0,
    int PurchasedReserved = 0);
