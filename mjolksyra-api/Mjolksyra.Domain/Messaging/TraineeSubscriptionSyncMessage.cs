namespace Mjolksyra.Domain.Messaging;

public enum TraineeSubscriptionSyncBillingMode
{
    ChargeNow = 0,
    NextCycle = 1
}

public class TraineeSubscriptionSyncMessage
{
    public required Guid TraineeId { get; set; }

    public required TraineeSubscriptionSyncBillingMode BillingMode { get; set; }
}
