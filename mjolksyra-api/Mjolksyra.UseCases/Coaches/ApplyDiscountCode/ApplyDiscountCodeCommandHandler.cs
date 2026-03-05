using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.ApplyDiscountCode;

public sealed class ApplyDiscountCodeCommandHandler
    : IRequestHandler<ApplyDiscountCodeCommand, OneOf<ApplyDiscountCodeSuccess, DiscountCodeNotFound, DiscountCodeExpired>>
{
    private readonly IDiscountCodeRepository _discountCodeRepository;
    private readonly IUserRepository _userRepository;
    private readonly ICoachPlatformBillingStripeGateway _stripeGateway;

    public ApplyDiscountCodeCommandHandler(
        IDiscountCodeRepository discountCodeRepository,
        IUserRepository userRepository,
        ICoachPlatformBillingStripeGateway stripeGateway)
    {
        _discountCodeRepository = discountCodeRepository;
        _userRepository = userRepository;
        _stripeGateway = stripeGateway;
    }

    public async Task<OneOf<ApplyDiscountCodeSuccess, DiscountCodeNotFound, DiscountCodeExpired>> Handle(
        ApplyDiscountCodeCommand request,
        CancellationToken cancellationToken)
    {
        var discountCode = await _discountCodeRepository.GetByCode(request.Code, cancellationToken);

        if (discountCode is null)
            return new DiscountCodeNotFound();

        if (!discountCode.IsActive)
            return new DiscountCodeExpired();

        if (discountCode.MaxRedemptions.HasValue && discountCode.RedeemedCount >= discountCode.MaxRedemptions.Value)
            return new DiscountCodeExpired();

        var user = await _userRepository.GetById(request.UserId, cancellationToken);
        if (user?.Coach?.Stripe is null)
            return new DiscountCodeNotFound();

        var coachStripe = user.Coach.Stripe;

        if (!string.IsNullOrWhiteSpace(coachStripe.PlatformSubscriptionId))
        {
            await _stripeGateway.ApplyCouponToSubscriptionAsync(
                coachStripe.PlatformSubscriptionId,
                discountCode.StripeCouponId,
                cancellationToken);
        }

        coachStripe.DiscountCodeId = discountCode.Id.ToString();
        discountCode.RedeemedCount++;

        await _userRepository.Update(user, cancellationToken);
        await _discountCodeRepository.Update(discountCode, cancellationToken);

        return new ApplyDiscountCodeSuccess();
    }
}
