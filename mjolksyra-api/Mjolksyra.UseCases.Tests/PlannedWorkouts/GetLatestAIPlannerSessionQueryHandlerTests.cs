using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.GetLatestAIPlannerSession;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class GetLatestAIPlannerSessionQueryHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserIsNotCoach_ReturnsNull()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = Guid.NewGuid(),
                AthleteUserId = userId,
                Status = TraineeStatus.Active,
            });

        var sessionRepository = new Mock<IAIPlannerSessionRepository>();

        var sut = new GetLatestAIPlannerSessionQueryHandler(
            sessionRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new GetLatestAIPlannerSessionQuery
        {
            TraineeId = traineeId,
        }, CancellationToken.None);

        Assert.Null(result);
        sessionRepository.Verify(
            x => x.GetLatestByTrainee(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_WhenUserIsCoach_ReturnsCoachScopedLatestSession()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var sessionId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var sessionRepository = new Mock<IAIPlannerSessionRepository>();
        sessionRepository
            .Setup(x => x.GetLatestByTrainee(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AIPlannerSession
            {
                Id = sessionId,
                TraineeId = traineeId,
                CoachUserId = userId,
                Description = "Strength block",
            });

        var sut = new GetLatestAIPlannerSessionQueryHandler(
            sessionRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new GetLatestAIPlannerSessionQuery
        {
            TraineeId = traineeId,
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(sessionId, result.SessionId);
    }
}
