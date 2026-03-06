using System.Net;
using Stripe;

namespace Mjolksyra.UseCases.Coaches.GetAppliedDiscountCode;

public sealed class CoachDiscountConfigurationStripeGateway(IStripeClient stripeClient)
    : ICoachDiscountConfigurationStripeGateway
{
    public async Task<StripeCouponConfiguration?> GetAppliedDiscountAsync(
        string? subscriptionId,
        string? fallbackCouponId,
        CancellationToken cancellationToken)
    {
        Coupon? coupon = null;
        string? couponId = fallbackCouponId;
        string? promotionCodeId = null;

        if (!string.IsNullOrWhiteSpace(subscriptionId))
        {
            var subscriptionService = new SubscriptionService(stripeClient);
            try
            {
                var subscription = await subscriptionService.GetAsync(
                    subscriptionId,
                    new SubscriptionGetOptions
                    {
                        Expand = ["discount.coupon", "discount.promotion_code"]
                    },
                    cancellationToken: cancellationToken);

                coupon = subscription.Discount?.Coupon;
                promotionCodeId = subscription.Discount?.PromotionCode?.Id;
                couponId = coupon?.Id ?? couponId;
            }
            catch (StripeException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound)
            {
                // Subscription no longer exists; fallback to direct coupon lookup if available.
            }
        }

        if (coupon is null && !string.IsNullOrWhiteSpace(couponId))
        {
            var couponService = new CouponService(stripeClient);
            try
            {
                coupon = await couponService.GetAsync(couponId, cancellationToken: cancellationToken);
            }
            catch (StripeException ex) when (ex.HttpStatusCode == HttpStatusCode.NotFound)
            {
                // Coupon removed in Stripe.
            }
        }

        if (coupon is null && string.IsNullOrWhiteSpace(promotionCodeId))
        {
            return null;
        }

        return new StripeCouponConfiguration(
            CouponId: coupon?.Id ?? couponId,
            PromotionCodeId: promotionCodeId,
            Name: coupon?.Name,
            PercentOff: coupon?.PercentOff,
            AmountOff: coupon?.AmountOff,
            Currency: coupon?.Currency,
            Duration: coupon?.Duration,
            DurationInMonths: coupon?.DurationInMonths,
            Valid: coupon?.Valid);
    }
}
