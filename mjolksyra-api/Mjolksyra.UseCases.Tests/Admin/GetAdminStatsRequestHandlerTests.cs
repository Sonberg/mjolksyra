using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.UseCases.Admin.GetAdminStats;

namespace Mjolksyra.UseCases.Tests.Admin;

public class GetAdminStatsRequestHandlerTests
{
    [Fact]
    public async Task Handle_ReturnsAggregatedStatsFromRepositories()
    {
        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.CountAsync(It.IsAny<CancellationToken>())).ReturnsAsync(100L);
        userRepository.Setup(x => x.CountCoachesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(25L);
        userRepository.Setup(x => x.CountAthletesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(75L);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.CountActiveAsync(It.IsAny<CancellationToken>())).ReturnsAsync(40L);
        traineeRepository.Setup(x => x.TotalRevenueAsync(It.IsAny<CancellationToken>())).ReturnsAsync(12345.67m);

        var sut = new GetAdminStatsRequestHandler(userRepository.Object, traineeRepository.Object);

        var result = await sut.Handle(new GetAdminStatsRequest(), CancellationToken.None);

        Assert.Equal(100L, result.TotalUsers);
        Assert.Equal(25L, result.TotalCoaches);
        Assert.Equal(75L, result.TotalAthletes);
        Assert.Equal(40L, result.ActiveSubscriptions);
        Assert.Equal(12345.67m, result.TotalRevenue);
    }

    [Fact]
    public async Task Handle_WhenNoData_ReturnsZeroes()
    {
        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.CountAsync(It.IsAny<CancellationToken>())).ReturnsAsync(0L);
        userRepository.Setup(x => x.CountCoachesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(0L);
        userRepository.Setup(x => x.CountAthletesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(0L);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.CountActiveAsync(It.IsAny<CancellationToken>())).ReturnsAsync(0L);
        traineeRepository.Setup(x => x.TotalRevenueAsync(It.IsAny<CancellationToken>())).ReturnsAsync(0m);

        var sut = new GetAdminStatsRequestHandler(userRepository.Object, traineeRepository.Object);

        var result = await sut.Handle(new GetAdminStatsRequest(), CancellationToken.None);

        Assert.Equal(0L, result.TotalUsers);
        Assert.Equal(0L, result.TotalCoaches);
        Assert.Equal(0L, result.TotalAthletes);
        Assert.Equal(0L, result.ActiveSubscriptions);
        Assert.Equal(0m, result.TotalRevenue);
    }
}
