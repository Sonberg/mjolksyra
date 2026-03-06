using MediatR;

namespace Mjolksyra.UseCases.Coaches.GetAppliedDiscountCode;

public sealed record GetAppliedDiscountCodeQuery(Guid UserId) : IRequest<GetAppliedDiscountCodeResponse>;

public sealed class GetAppliedDiscountCodeResponse
{
    public string? Code { get; set; }

    public string? Description { get; set; }

    public string? StripeCouponId { get; set; }

    public string? StripePromotionCodeId { get; set; }

    public StripeCouponConfigurationResponse? StripeCoupon { get; set; }
}

public sealed class StripeCouponConfigurationResponse
{
    public string? Id { get; set; }

    public string? Name { get; set; }

    public decimal? PercentOff { get; set; }

    public long? AmountOff { get; set; }

    public string? Currency { get; set; }

    public string? Duration { get; set; }

    public long? DurationInMonths { get; set; }

    public bool? Valid { get; set; }
}
