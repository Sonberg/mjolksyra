using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Database.Enum;

namespace Mjolksyra.UseCases.Trainees;

public interface ITraineeResponseBuilder
{
    Task<TraineeResponse> Build(Trainee trainee, CancellationToken cancellationToken);
}

public class TraineeResponseBuilder : ITraineeResponseBuilder
{
    private readonly IUserRepository _userRepository;

    public TraineeResponseBuilder(IUserRepository userRepository)
    {
        _userRepository = userRepository;
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

        var billingStatus = hasSubscription
            ? TraineeBillingStatus.SubscriptionActive
            : !hasPrice
                ? TraineeBillingStatus.PriceNotSet
                : !athletePaymentReady
                    ? TraineeBillingStatus.AwaitingAthletePaymentMethod
                    : !coachStripeReady
                        ? TraineeBillingStatus.AwaitingCoachStripeSetup
                        : TraineeBillingStatus.PriceSet;

        return new TraineeResponse
        {
            Id = trainee.Id,
            Athlete = TraineeUserResponse.From(athlete),
            Coach = TraineeUserResponse.From(coach),
            Cost = TraineeCostResponse.From(TraineeTransactionCost.From(trainee.Cost)),
            LastWorkoutAt = DateTimeOffset.UtcNow.AddMonths(1),
            NextWorkoutAt = DateTimeOffset.UtcNow.AddHours(2),
            Billing = new TraineeBillingResponse
            {
                Status = billingStatus,
                HasPrice = hasPrice,
                HasSubscription = hasSubscription,
                LastChargedAt = lastChargedAt
            },
            CreatedAt = trainee.CreatedAt
        };
    }
}
