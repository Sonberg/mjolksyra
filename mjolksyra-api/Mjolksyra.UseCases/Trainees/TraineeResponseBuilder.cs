using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Database.Enum;
using Stripe;

namespace Mjolksyra.UseCases.Trainees;

public interface ITraineeResponseBuilder
{
    Task<TraineeResponse> Build(Trainee trainee, CancellationToken cancellationToken);
}

public class TraineeResponseBuilder : ITraineeResponseBuilder
{
    private readonly IUserRepository _userRepository;
    private readonly IPlannedWorkoutRepository _plannedWorkoutRepository;
    private readonly IStripeClient _stripeClient;

    public TraineeResponseBuilder(
        IUserRepository userRepository,
        IPlannedWorkoutRepository plannedWorkoutRepository,
        IStripeClient stripeClient)
    {
        _userRepository = userRepository;
        _plannedWorkoutRepository = plannedWorkoutRepository;
        _stripeClient = stripeClient;
    }

    public async Task<TraineeResponse> Build(Trainee trainee, CancellationToken cancellationToken)
    {
        var athleteTask = _userRepository.GetById(trainee.AthleteUserId, cancellationToken);
        var coachTask = _userRepository.GetById(trainee.CoachUserId, cancellationToken);

        await Task.WhenAll(athleteTask, coachTask);

        var athlete = athleteTask.Result;
        var coach = coachTask.Result;
        var hasPrice = trainee.Cost.Amount > 0;
        var hasSubscription = trainee.StripeSubscriptionId is not null;
        var athletePaymentReady =
            athlete.Athlete?.Stripe?.PaymentMethodId is not null &&
            athlete.Athlete.Stripe.Status == StripeStatus.Succeeded;
        var coachStripeReady =
            coach.Coach?.Stripe?.AccountId is not null &&
            coach.Coach.Stripe.Status == StripeStatus.Succeeded;
        var lastChargedAt = trainee.Transactions
            .Where(x => x.Status == TraineeTransactionStatus.Succeeded)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => (DateTimeOffset?)x.CreatedAt)
            .FirstOrDefault();

        DateTimeOffset? nextChargedAt = null;
        if (hasSubscription && trainee.StripeSubscriptionId is { } subscriptionId)
        {
            try
            {
                var subscriptionService = new SubscriptionService(_stripeClient);
                var subscription = await subscriptionService.GetAsync(subscriptionId, cancellationToken: cancellationToken);

                if (subscription.CurrentPeriodEnd is { } currentPeriodEnd)
                {
                    nextChargedAt = currentPeriodEnd.Kind == DateTimeKind.Unspecified
                        ? new DateTimeOffset(DateTime.SpecifyKind(currentPeriodEnd, DateTimeKind.Utc))
                        : new DateTimeOffset(currentPeriodEnd.ToUniversalTime());
                }
            }
            catch
            {
                // Fallback below keeps the dashboard usable if Stripe lookup fails.
            }
        }

        nextChargedAt ??= hasSubscription ? lastChargedAt?.AddMonths(1) : null;

        var billingStatus = hasSubscription
            ? TraineeBillingStatus.SubscriptionActive
            : !hasPrice
                ? TraineeBillingStatus.PriceNotSet
                : !athletePaymentReady
                    ? TraineeBillingStatus.AwaitingAthletePaymentMethod
                    : !coachStripeReady
                        ? TraineeBillingStatus.AwaitingCoachStripeSetup
                        : TraineeBillingStatus.PriceSet;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var nextWorkoutTask = _plannedWorkoutRepository.Get(new Domain.Database.Common.PlannedWorkoutCursor
        {
            Page = 0,
            Size = 1,
            TraineeId = trainee.Id,
            FromDate = today,
            ToDate = null,
            SortBy = ["PlannedAt"],
            Order = SortOrder.Asc
        }, cancellationToken);
        var lastWorkoutTask = _plannedWorkoutRepository.Get(new Domain.Database.Common.PlannedWorkoutCursor
        {
            Page = 0,
            Size = 1,
            TraineeId = trainee.Id,
            FromDate = null,
            ToDate = today,
            SortBy = ["PlannedAt"],
            Order = SortOrder.Desc
        }, cancellationToken);

        await Task.WhenAll(nextWorkoutTask, lastWorkoutTask);

        static DateTimeOffset? ToDateTimeOffset(DateOnly? date) =>
            date is null
                ? null
                : new DateTimeOffset(DateTime.SpecifyKind(date.Value.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc));

        var nextWorkoutAt = nextWorkoutTask.Result.Data.FirstOrDefault()?.PlannedAt;
        var lastWorkoutAt = lastWorkoutTask.Result.Data.FirstOrDefault()?.PlannedAt;

        return new TraineeResponse
        {
            Id = trainee.Id,
            Athlete = TraineeUserResponse.From(athlete),
            Coach = TraineeUserResponse.From(coach),
            Cost = TraineeCostResponse.From(TraineeTransactionCost.From(trainee.Cost)),
            LastWorkoutAt = ToDateTimeOffset(lastWorkoutAt),
            NextWorkoutAt = ToDateTimeOffset(nextWorkoutAt),
            Billing = new TraineeBillingResponse
            {
                Status = billingStatus,
                HasPrice = hasPrice,
                HasSubscription = hasSubscription,
                LastChargedAt = lastChargedAt,
                NextChargedAt = nextChargedAt
            },
            CreatedAt = trainee.CreatedAt
        };
    }
}
