using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;

public sealed class EnsureCoachPlatformSubscriptionCommandHandler
    : IRequestHandler<EnsureCoachPlatformSubscriptionCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly ITraineeRepository _traineeRepository;
    private readonly ICoachPlatformBillingStripeGateway _stripeGateway;
    private readonly IDiscountCodeRepository _discountCodeRepository;
    private readonly IPlanRepository _planRepository;

    public EnsureCoachPlatformSubscriptionCommandHandler(
        IUserRepository userRepository,
        ITraineeRepository traineeRepository,
        ICoachPlatformBillingStripeGateway stripeGateway,
        IDiscountCodeRepository discountCodeRepository,
        IPlanRepository planRepository)
    {
        _userRepository = userRepository;
        _traineeRepository = traineeRepository;
        _stripeGateway = stripeGateway;
        _discountCodeRepository = discountCodeRepository;
        _planRepository = planRepository;
    }

    public async Task Handle(EnsureCoachPlatformSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetById(request.UserId, cancellationToken);
        if (user?.Coach?.Stripe is null) return;

        var coachStripe = user.Coach.Stripe;
        if (coachStripe.Status != StripeStatus.Succeeded || string.IsNullOrWhiteSpace(coachStripe.AccountId))
        {
            return;
        }

        if (!string.IsNullOrWhiteSpace(coachStripe.PlatformSubscriptionId))
        {
            var hasActiveSubscription = await _stripeGateway.HasActiveSubscriptionAsync(
                coachStripe.PlatformSubscriptionId,
                cancellationToken);

            if (hasActiveSubscription)
            {
                var activePlanId = coachStripe.PlanId ?? Domain.Database.Models.Plan.StarterPlanId;
                var activePlan = await _planRepository.GetById(activePlanId, cancellationToken);
                var activeIncluded = activePlan?.IncludedAthletes ?? 10;
                await _stripeGateway.SyncOverageQuantityAsync(
                    user.Id,
                    coachStripe.PlatformSubscriptionId,
                    await ResolveOverageQuantity(user.Id, activeIncluded, cancellationToken),
                    cancellationToken);
                return;
            }

            coachStripe.PlatformSubscriptionId = null;
        }

        if (string.IsNullOrWhiteSpace(coachStripe.PlatformCustomerId))
        {
            coachStripe.PlatformCustomerId = await _stripeGateway.CreateCustomerAsync(
                user.Id,
                user.Email.Value,
                user.GivenName,
                user.FamilyName,
                cancellationToken);
        }

        string? couponId = null;
        if (!string.IsNullOrWhiteSpace(coachStripe.DiscountCodeId)
            && Guid.TryParse(coachStripe.DiscountCodeId, out var discountCodeGuid))
        {
            var discountCode = await _discountCodeRepository.GetById(discountCodeGuid, cancellationToken);
            couponId = discountCode?.StripeCouponId;
        }

        var planId = coachStripe.PlanId ?? Domain.Database.Models.Plan.StarterPlanId;
        var plan = await _planRepository.GetById(planId, cancellationToken)
            ?? await _planRepository.GetById(Domain.Database.Models.Plan.StarterPlanId, cancellationToken);

        var baseAmountOre = plan is not null ? (long)plan.MonthlyPriceSek * 100 : 39900L;
        var overageAmountOre = plan is not null ? (long)plan.ExtraAthletePriceSek * 100 : 3900L;
        var includedAthletes = plan?.IncludedAthletes ?? 10;

        coachStripe.PlatformSubscriptionId = await _stripeGateway.CreateSubscriptionAsync(
            user.Id,
            coachStripe.PlatformCustomerId,
            await ResolveOverageQuantity(user.Id, includedAthletes, cancellationToken),
            baseAmountOre,
            overageAmountOre,
            cancellationToken,
            couponId);
        coachStripe.TrialEndsAt = DateTimeOffset.UtcNow.AddDays(14);

        await _userRepository.Update(user, cancellationToken);
    }

    private async Task<int> ResolveOverageQuantity(Guid coachUserId, int includedAthletes, CancellationToken cancellationToken)
    {
        var activeAthleteCount = await _traineeRepository.CountActiveByCoachId(coachUserId, cancellationToken);
        return Math.Max(0, activeAthleteCount - includedAthletes);
    }
}
