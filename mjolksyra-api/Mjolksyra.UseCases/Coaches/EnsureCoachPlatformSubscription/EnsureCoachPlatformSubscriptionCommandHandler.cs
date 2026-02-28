using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;

public sealed class EnsureCoachPlatformSubscriptionCommandHandler
    : IRequestHandler<EnsureCoachPlatformSubscriptionCommand>
{
    private readonly IUserRepository _userRepository;
    private readonly ICoachPlatformBillingStripeGateway _stripeGateway;

    public EnsureCoachPlatformSubscriptionCommandHandler(
        IUserRepository userRepository,
        ICoachPlatformBillingStripeGateway stripeGateway)
    {
        _userRepository = userRepository;
        _stripeGateway = stripeGateway;
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

        coachStripe.PlatformSubscriptionId = await _stripeGateway.CreateSubscriptionAsync(
            user.Id,
            coachStripe.PlatformCustomerId,
            cancellationToken);

        await _userRepository.Update(user, cancellationToken);
    }
}
