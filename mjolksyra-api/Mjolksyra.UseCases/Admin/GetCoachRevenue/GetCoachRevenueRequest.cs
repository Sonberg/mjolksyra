using MediatR;

namespace Mjolksyra.UseCases.Admin.GetCoachRevenue;

public class GetCoachRevenueRequest : IRequest<ICollection<CoachRevenueItem>>
{
}

public class CoachRevenueItem
{
    public required Guid CoachUserId { get; set; }

    public required string CoachName { get; set; }

    public required string CoachEmail { get; set; }

    public required int ActiveSubscriptions { get; set; }

    public required decimal MonthlyAthleteRevenue { get; set; }

    public required decimal TotalAthleteRevenue { get; set; }

    public required string BillingSetupStatus { get; set; }

    public required string PlatformFeeStatus { get; set; }

    public DateTimeOffset? PlatformFeeTrialEndsAt { get; set; }
}
