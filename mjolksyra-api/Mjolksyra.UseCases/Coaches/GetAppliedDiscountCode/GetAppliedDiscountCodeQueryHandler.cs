using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Coaches.GetAppliedDiscountCode;

public sealed class GetAppliedDiscountCodeQueryHandler(
    IUserRepository userRepository,
    IDiscountCodeRepository discountCodeRepository,
    ICoachDiscountConfigurationStripeGateway stripeGateway)
    : IRequestHandler<GetAppliedDiscountCodeQuery, GetAppliedDiscountCodeResponse>
{
    public async Task<GetAppliedDiscountCodeResponse> Handle(GetAppliedDiscountCodeQuery request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetById(request.UserId, cancellationToken);
        var discountCodeId = user.Coach?.Stripe?.DiscountCodeId;

        var discountCode = discountCodeId is { Length: > 0 } rawId && Guid.TryParse(rawId, out var parsedId)
            ? await discountCodeRepository.GetById(parsedId, cancellationToken)
            : null;

        var stripeConfiguration = await stripeGateway.GetAppliedDiscountAsync(
            user.Coach?.Stripe?.PlatformSubscriptionId,
            discountCode?.StripeCouponId,
            cancellationToken);

        return new GetAppliedDiscountCodeResponse
        {
            Code = discountCode?.Code,
            Description = discountCode?.Description,
            StripeCouponId = stripeConfiguration?.CouponId ?? discountCode?.StripeCouponId,
            StripePromotionCodeId = stripeConfiguration?.PromotionCodeId,
            StripeCoupon = stripeConfiguration is null
                ? null
                : new StripeCouponConfigurationResponse
                {
                    Id = stripeConfiguration.CouponId,
                    Name = stripeConfiguration.Name,
                    PercentOff = stripeConfiguration.PercentOff,
                    AmountOff = stripeConfiguration.AmountOff,
                    Currency = stripeConfiguration.Currency,
                    Duration = stripeConfiguration.Duration,
                    DurationInMonths = stripeConfiguration.DurationInMonths,
                    Valid = stripeConfiguration.Valid,
                }
        };
    }
}
