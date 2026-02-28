using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;

public sealed class EnsureCoachPlatformSubscriptionCommandHandler
    : IRequestHandler<EnsureCoachPlatformSubscriptionCommand>
{
    private const int IncludedAthletes = 10;
    private readonly IUserRepository _userRepository;
    private readonly ITraineeRepository _traineeRepository;
    private readonly ICoachPlatformBillingStripeGateway _stripeGateway;

    public EnsureCoachPlatformSubscriptionCommandHandler(
        IUserRepository userRepository,
        ITraineeRepository traineeRepository,
        ICoachPlatformBillingStripeGateway stripeGateway)
    {
        _userRepository = userRepository;
        _traineeRepository = traineeRepository;
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
                await _stripeGateway.SyncOverageQuantityAsync(
                    user.Id,
                    coachStripe.PlatformSubscriptionId,
                    await ResolveOverageQuantity(user.Id, cancellationToken),
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

        coachStripe.PlatformSubscriptionId = await _stripeGateway.CreateSubscriptionAsync(
            user.Id,
            coachStripe.PlatformCustomerId,
            await ResolveOverageQuantity(user.Id, cancellationToken),
            cancellationToken);

        await _userRepository.Update(user, cancellationToken);
    }

    private async Task<int> ResolveOverageQuantity(Guid coachUserId, CancellationToken cancellationToken)
    {
        var activeAthleteCount = await _traineeRepository.CountActiveByCoachId(coachUserId, cancellationToken);
        return Math.Max(0, activeAthleteCount - IncludedAthletes);
    }
}
