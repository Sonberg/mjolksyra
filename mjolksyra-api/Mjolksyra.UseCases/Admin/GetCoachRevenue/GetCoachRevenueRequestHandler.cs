using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Admin.GetCoachRevenue;

public class GetCoachRevenueRequestHandler(
    IUserRepository userRepository,
    ITraineeRepository traineeRepository,
    ITraineeTransactionRepository transactionRepository
) : IRequestHandler<GetCoachRevenueRequest, ICollection<CoachRevenueItem>>
{
    public async Task<ICollection<CoachRevenueItem>> Handle(GetCoachRevenueRequest request, CancellationToken cancellationToken)
    {
        var coaches = await userRepository.GetCoachUsersAsync(cancellationToken);
        var trainees = await traineeRepository.GetAllAsync(cancellationToken);
        var allTransactions = await transactionRepository.GetAllAsync(cancellationToken);
        var athleteIds = trainees.Select(x => x.AthleteUserId).Distinct().ToList();
        var athletes = athleteIds.Count == 0
            ? new Dictionary<Guid, User>()
            : (await userRepository.GetManyById(athleteIds, cancellationToken))
            .ToDictionary(x => x.Id, x => x);

        var traineesByCoach = trainees
            .GroupBy(x => x.CoachUserId)
            .ToDictionary(x => x.Key, x => x.ToList());

        var transactionsByTrainee = allTransactions
            .GroupBy(x => x.TraineeId)
            .ToDictionary(x => x.Key, x => x.ToList());

        var now = DateTimeOffset.UtcNow;
        var result = coaches
            .Select(coach =>
            {
                traineesByCoach.TryGetValue(coach.Id, out var coachTrainees);
                var items = coachTrainees ?? [];

                var activeSubscriptions = items.Count(x => x.Status == TraineeStatus.Active);
                var monthlyAthleteRevenue = items
                    .Where(x => x.Status == TraineeStatus.Active)
                    .Sum(x => (decimal)x.Cost.Amount);
                var totalAthleteRevenue = items
                    .SelectMany(x => transactionsByTrainee.TryGetValue(x.Id, out var txns) ? txns : [])
                    .Where(x => x.Status == TraineeTransactionStatus.Succeeded)
                    .Sum(x => (decimal)x.Cost.Total);

                var stripe = coach.Coach?.Stripe;
                return new CoachRevenueItem
                {
                    CoachUserId = coach.Id,
                    CoachName = ResolveCoachName(coach),
                    CoachEmail = coach.Email.Value,
                    ActiveSubscriptions = activeSubscriptions,
                    MonthlyAthleteRevenue = monthlyAthleteRevenue,
                    TotalAthleteRevenue = totalAthleteRevenue,
                    BillingSetupStatus = ResolveBillingSetupStatus(stripe),
                    PlatformFeeStatus = ResolvePlatformFeeStatus(stripe, now),
                    PlatformFeeTrialEndsAt = stripe?.TrialEndsAt,
                    Athletes = items
                        .Select(trainee =>
                        {
                            athletes.TryGetValue(trainee.AthleteUserId, out var athlete);
                            return new CoachAthleteStatusItem
                            {
                                AthleteUserId = trainee.AthleteUserId,
                                AthleteName = ResolveAthleteName(athlete),
                                AthleteEmail = athlete?.Email.Value ?? "Unknown",
                                RelationshipStatus = trainee.Status.ToString(),
                                BillingStatus = ResolveAthleteBillingStatus(athlete, trainee),
                            };
                        })
                        .OrderBy(x => x.AthleteName)
                        .ToList(),
                };
            })
            .OrderByDescending(x => x.TotalAthleteRevenue)
            .ThenByDescending(x => x.MonthlyAthleteRevenue)
            .ThenBy(x => x.CoachName)
            .ToList();

        return result;
    }

    private static string ResolveCoachName(User coach)
    {
        var given = coach.GivenName?.Trim();
        var family = coach.FamilyName?.Trim();
        var fullName = $"{given} {family}".Trim();

        return string.IsNullOrWhiteSpace(fullName) ? coach.Email.Value : fullName;
    }

    private static string ResolvePlatformFeeStatus(UserCoachStripe? stripe, DateTimeOffset now)
    {
        if (stripe == null || stripe.Status != StripeStatus.Succeeded)
        {
            return "Stripe not ready";
        }

        if (string.IsNullOrWhiteSpace(stripe.PlatformSubscriptionId))
        {
            return "Not subscribed";
        }

        if (stripe.TrialEndsAt.HasValue && stripe.TrialEndsAt.Value > now)
        {
            return "Trialing";
        }

        return "Active";
    }

    private static string ResolveBillingSetupStatus(UserCoachStripe? stripe)
    {
        var stripeReady = stripe?.Status == StripeStatus.Succeeded;
        var feeSubscriptionReady = !string.IsNullOrWhiteSpace(stripe?.PlatformSubscriptionId);

        return stripeReady && feeSubscriptionReady ? "Configured" : "Needs action";
    }

    private static string ResolveAthleteName(User? athlete)
    {
        if (athlete is null) return "Unknown athlete";

        var fullName = $"{athlete.GivenName} {athlete.FamilyName}".Trim();
        return string.IsNullOrWhiteSpace(fullName) ? athlete.Email.Value : fullName;
    }

    private static string ResolveAthleteBillingStatus(User? athlete, Trainee trainee)
    {
        if (trainee.Status != TraineeStatus.Active)
        {
            return "Inactive relationship";
        }

        if (athlete?.Athlete?.Stripe?.Status != StripeStatus.Succeeded)
        {
            return "Payment method missing";
        }

        if (string.IsNullOrWhiteSpace(trainee.StripeSubscriptionId))
        {
            return "Subscription missing";
        }

        return "Configured";
    }
}