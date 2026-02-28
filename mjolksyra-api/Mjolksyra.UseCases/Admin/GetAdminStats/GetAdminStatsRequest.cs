using MediatR;

namespace Mjolksyra.UseCases.Admin.GetAdminStats;

public class GetAdminStatsRequest : IRequest<AdminStatsResponse>
{
}

public class AdminStatsResponse
{
    public required long TotalUsers { get; set; }

    public required long TotalCoaches { get; set; }

    public required long TotalAthletes { get; set; }

    public required long ActiveSubscriptions { get; set; }

    public required decimal TotalRevenue { get; set; }
}
