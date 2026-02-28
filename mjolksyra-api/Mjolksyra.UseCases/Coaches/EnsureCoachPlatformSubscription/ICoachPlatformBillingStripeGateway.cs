namespace Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;

public interface ICoachPlatformBillingStripeGateway
{
    Task<bool> HasActiveSubscriptionAsync(string subscriptionId, CancellationToken cancellationToken);

    Task<string> CreateCustomerAsync(
        Guid userId,
        string email,
        string? givenName,
        string? familyName,
        CancellationToken cancellationToken);

    Task<string> CreateSubscriptionAsync(
        Guid userId,
        string customerId,
        int overageQuantity,
        CancellationToken cancellationToken);

    Task SyncOverageQuantityAsync(
        Guid userId,
        string subscriptionId,
        int overageQuantity,
        CancellationToken cancellationToken);
}
