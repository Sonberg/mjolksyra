using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;

namespace Mjolksyra.UseCases.Coaches.UpdateCoachPlan;

public class UpdateCoachPlanCommandHandler(
    IUserRepository userRepository,
    IPlanRepository planRepository,
    ITraineeRepository traineeRepository,
    ICoachPlatformBillingStripeGateway stripeGateway) : IRequestHandler<UpdateCoachPlanCommand>
{
    public async Task Handle(UpdateCoachPlanCommand request, CancellationToken cancellationToken)
    {
        var user = await userRepository.GetById(request.UserId, cancellationToken);
        if (user?.Coach?.Stripe is null) return;

        var plan = await planRepository.GetById(request.PlanId, cancellationToken);
        if (plan is null) return;

        user.Coach.Stripe.PlanId = plan.Id;

        if (!string.IsNullOrWhiteSpace(user.Coach.Stripe.PlatformSubscriptionId))
        {
            var activeAthleteCount = await traineeRepository.CountActiveByCoachId(user.Id, cancellationToken);
            var overageQuantity = Math.Max(0, activeAthleteCount - plan.IncludedAthletes);

            await stripeGateway.UpdateSubscriptionPlanAsync(
                user.Id,
                user.Coach.Stripe.PlatformSubscriptionId,
                (long)plan.MonthlyPriceSek * 100,
                (long)plan.ExtraAthletePriceSek * 100,
                overageQuantity,
                cancellationToken);
        }

        await userRepository.Update(user, cancellationToken);
    }
}
