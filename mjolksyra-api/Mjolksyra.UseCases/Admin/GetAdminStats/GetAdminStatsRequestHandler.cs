using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Admin.GetAdminStats;

public class GetAdminStatsRequestHandler(
    IUserRepository userRepository,
    ITraineeRepository traineeRepository
) : IRequestHandler<GetAdminStatsRequest, AdminStatsResponse>
{
    public async Task<AdminStatsResponse> Handle(GetAdminStatsRequest request, CancellationToken cancellationToken)
    {
        var totalUsers = await userRepository.CountAsync(cancellationToken);
        var totalCoaches = await userRepository.CountCoachesAsync(cancellationToken);
        var totalAthletes = await userRepository.CountAthletesAsync(cancellationToken);
        var activeSubscriptions = await traineeRepository.CountActiveAsync(cancellationToken);
        var totalRevenue = await traineeRepository.TotalRevenueAsync(cancellationToken);

        return new AdminStatsResponse
        {
            TotalUsers = totalUsers,
            TotalCoaches = totalCoaches,
            TotalAthletes = totalAthletes,
            ActiveSubscriptions = activeSubscriptions,
            TotalRevenue = totalRevenue,
        };
    }
}
