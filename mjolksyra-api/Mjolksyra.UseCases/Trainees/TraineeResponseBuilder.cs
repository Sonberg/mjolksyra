using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
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
    private readonly ITraineeTransactionRepository _transactionRepository;

    public TraineeResponseBuilder(
        IUserRepository userRepository,
        IPlannedWorkoutRepository plannedWorkoutRepository,
        IStripeClient stripeClient,
        ITraineeTransactionRepository transactionRepository)
    {
        _userRepository = userRepository;
        _plannedWorkoutRepository = plannedWorkoutRepository;
        _stripeClient = stripeClient;
        _transactionRepository = transactionRepository;
    }

    public async Task<TraineeResponse> Build(Trainee trainee, CancellationToken cancellationToken)
    {
        var athleteTask = _userRepository.GetById(trainee.AthleteUserId, cancellationToken);
        var coachTask = _userRepository.GetById(trainee.CoachUserId, cancellationToken);
        var transactionsTask = _transactionRepository.GetByTraineeId(trainee.Id, cancellationToken);

        await Task.WhenAll(athleteTask, coachTask, transactionsTask);

        var athlete = athleteTask.Result;
        var coach = coachTask.Result;
        var transactions = transactionsTask.Result;
        var hasPrice = trainee.Cost.Amount > 0;
        var hasSubscription = trainee.StripeSubscriptionId is not null;
        var athletePaymentReady =
            athlete.Athlete?.Stripe?.PaymentMethodId is not null &&
            athlete.Athlete.Stripe.Status == StripeStatus.Succeeded;
        var coachStripeReady =
            coach.Coach?.Stripe?.AccountId is not null &&
            coach.Coach.Stripe.Status == StripeStatus.Succeeded;
        var lastChargedAt = transactions
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

        var billingStatus = hasSubscription && trainee.PaymentFailedAt != null
            ? TraineeBillingStatus.PaymentFailed
            : hasSubscription
                ? TraineeBillingStatus.SubscriptionActive
                : !hasPrice
                    ? TraineeBillingStatus.PriceNotSet
                    : !athletePaymentReady
                        ? TraineeBillingStatus.AwaitingAthletePaymentMethod
                        : !coachStripeReady
                            ? TraineeBillingStatus.AwaitingCoachStripeSetup
                            : TraineeBillingStatus.PriceSet;

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var nextWorkoutTask = _plannedWorkoutRepository.Get(new PlannedWorkoutCursor
        {
            Page = 0,
            Size = 1,
            TraineeId = trainee.Id,
            FromDate = today,
            ToDate = null,
            SortBy = ["PlannedAt"],
            Order = SortOrder.Asc,
            DraftOnly = false
        }, cancellationToken);

        var lastWorkoutTask = _plannedWorkoutRepository.Get(new PlannedWorkoutCursor
        {
            Page = 0,
            Size = 1,
            TraineeId = trainee.Id,
            FromDate = today,
            ToDate = null,
            SortBy = ["PlannedAt"],
            Order = SortOrder.Desc,
            DraftOnly = false
        }, cancellationToken);

        await Task.WhenAll(nextWorkoutTask, lastWorkoutTask);

        var nextWorkoutAt = nextWorkoutTask.Result.Data.Min(x => x.PlannedAt);
        var lastWorkoutAt = lastWorkoutTask.Result.Data.Max(x => x.PlannedAt);

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
            Transactions = transactions
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TraineeTransactionResponse
                {
                    Id = t.Id,
                    Status = t.Status.ToString(),
                    Amount = t.Cost.Total,
                    Currency = t.Cost.Currency,
                    CreatedAt = t.CreatedAt,
                    ReceiptUrl = t.ReceiptUrl
                })
                .ToList(),
            CreatedAt = trainee.CreatedAt
        };

        static DateTimeOffset? ToDateTimeOffset(DateOnly? date) =>
            date is null
                ? null
                : new DateTimeOffset(DateTime.SpecifyKind(date.Value.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc));
    }
}