using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.DeleteAIPlannerSession;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class DeleteAIPlannerSessionCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenCoachHasAccess_DeletesSession()
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
            .Setup(x => x.GetById(sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AIPlannerSession
            {
                Id = sessionId,
                TraineeId = traineeId,
                CoachUserId = userId,
                Description = "Strength block",
            });

        var sut = new DeleteAIPlannerSessionCommandHandler(
            sessionRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new DeleteAIPlannerSessionCommand
        {
            TraineeId = traineeId,
            SessionId = sessionId,
        }, CancellationToken.None);

        Assert.True(result);
        sessionRepository.Verify(x => x.Delete(sessionId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenCoachLacksAccess_ReturnsFalse()
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

        var sut = new DeleteAIPlannerSessionCommandHandler(
            sessionRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new DeleteAIPlannerSessionCommand
        {
            TraineeId = traineeId,
            SessionId = Guid.NewGuid(),
        }, CancellationToken.None);

        Assert.False(result);
        sessionRepository.Verify(x => x.Delete(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenSessionBelongsToAnotherCoach_ReturnsFalse()
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
            .Setup(x => x.GetById(sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AIPlannerSession
            {
                Id = sessionId,
                TraineeId = traineeId,
                CoachUserId = Guid.NewGuid(),
                Description = "Other coach session",
            });

        var sut = new DeleteAIPlannerSessionCommandHandler(
            sessionRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new DeleteAIPlannerSessionCommand
        {
            TraineeId = traineeId,
            SessionId = sessionId,
        }, CancellationToken.None);

        Assert.False(result);
        sessionRepository.Verify(x => x.Delete(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
