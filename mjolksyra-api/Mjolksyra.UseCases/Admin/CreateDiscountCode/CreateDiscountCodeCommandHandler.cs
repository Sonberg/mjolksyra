using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Stripe;

namespace Mjolksyra.UseCases.Admin.CreateDiscountCode;

public sealed class CreateDiscountCodeCommandHandler : IRequestHandler<CreateDiscountCodeCommand, CreateDiscountCodeResult>
{
    private readonly IDiscountCodeRepository _repository;
    private readonly IStripeClient _stripeClient;

    public CreateDiscountCodeCommandHandler(IDiscountCodeRepository repository, IStripeClient stripeClient)
    {
        _repository = repository;
        _stripeClient = stripeClient;
    }

    public async Task<CreateDiscountCodeResult> Handle(CreateDiscountCodeCommand request, CancellationToken cancellationToken)
    {
        var couponService = new CouponService(_stripeClient);
        var couponOptions = new CouponCreateOptions
        {
            Name = request.Description,
            Duration = request.Duration switch
            {
                DiscountDuration.Forever => "forever",
                DiscountDuration.Once => "once",
                DiscountDuration.Repeating => "repeating",
                _ => "forever",
            },
            DurationInMonths = request.Duration == DiscountDuration.Repeating ? request.DurationInMonths : null,
            MaxRedemptions = request.MaxRedemptions,
        };

        if (request.DiscountType == DiscountType.Percent)
        {
            couponOptions.PercentOff = request.DiscountValue;
        }
        else
        {
            couponOptions.AmountOff = request.DiscountValue;
            couponOptions.Currency = "sek";
        }

        var coupon = await couponService.CreateAsync(couponOptions, cancellationToken: cancellationToken);

        var discountCode = await _repository.Create(new DiscountCode
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            StripeCouponId = coupon.Id,
            Description = request.Description,
            MaxRedemptions = request.MaxRedemptions,
            RedeemedCount = 0,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);

        return new CreateDiscountCodeResult
        {
            Id = discountCode.Id,
            Code = discountCode.Code,
            Description = discountCode.Description,
        };
    }
}
