namespace Mjolksyra.UseCases.Coaches.GetAppliedDiscountCode;

public sealed record StripeCouponConfiguration(
    string? CouponId,
    string? PromotionCodeId,
    string? Name,
    decimal? PercentOff,
    long? AmountOff,
    string? Currency,
    string? Duration,
    long? DurationInMonths,
    bool? Valid);

public interface ICoachDiscountConfigurationStripeGateway
{
    Task<StripeCouponConfiguration?> GetAppliedDiscountAsync(
        string? subscriptionId,
        string? fallbackCouponId,
        CancellationToken cancellationToken);
}
