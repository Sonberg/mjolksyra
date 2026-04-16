using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Trainees.GetTraineeInsights;

namespace Mjolksyra.UseCases.Tests.Trainees;

public class GetTraineeInsightsQueryHandlerTests
{
    private static GetTraineeInsightsQueryHandler CreateSut(
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<ITraineeInsightsRepository>? traineeInsightsRepository = null,
        Mock<IUserContext>? userContext = null)
    {
        return new GetTraineeInsightsQueryHandler(
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (traineeInsightsRepository ?? new Mock<ITraineeInsightsRepository>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object);
    }

    [Fact]
    public async Task Handle_WhenUserNotAuthenticated_ReturnsNull()
    {
        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid?)null);

        var sut = CreateSut(userContext: userContext);

        var result = await sut.Handle(new GetTraineeInsightsQuery(Guid.NewGuid()), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenNoAccess_ReturnsNull()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var sut = CreateSut(traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(new GetTraineeInsightsQuery(traineeId), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenInsightsNotFound_ReturnsNull()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var traineeInsightsRepository = new Mock<ITraineeInsightsRepository>();
        traineeInsightsRepository
            .Setup(x => x.GetByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((TraineeInsights?)null);

        var sut = CreateSut(
            traineeRepository: traineeRepository,
            traineeInsightsRepository: traineeInsightsRepository,
            userContext: userContext);

        var result = await sut.Handle(new GetTraineeInsightsQuery(traineeId), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenCoach_ReturnsInsightsRegardlessOfVisibility()
    {
        var coachUserId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(coachUserId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, coachUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = coachUserId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var traineeInsightsRepository = new Mock<ITraineeInsightsRepository>();
        traineeInsightsRepository
            .Setup(x => x.GetByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TraineeInsights
            {
                Id = traineeId,
                Status = InsightsStatus.Ready,
                VisibleToAthlete = false, // not visible, but coach should still see it
                CreatedAt = DateTimeOffset.UtcNow,
                Strengths = [],
                Weaknesses = [],
                Recommendations = [],
            });

        var sut = CreateSut(
            traineeRepository: traineeRepository,
            traineeInsightsRepository: traineeInsightsRepository,
            userContext: userContext);

        var result = await sut.Handle(new GetTraineeInsightsQuery(traineeId), CancellationToken.None);

        Assert.NotNull(result);
    }

    [Fact]
    public async Task Handle_WhenAthleteAndInsightsNotVisible_ReturnsNull()
    {
        var athleteUserId = Guid.NewGuid();
        var coachUserId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(athleteUserId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, athleteUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = coachUserId,    // different from athleteUserId
                AthleteUserId = athleteUserId,
                Status = TraineeStatus.Active,
            });

        var traineeInsightsRepository = new Mock<ITraineeInsightsRepository>();
        traineeInsightsRepository
            .Setup(x => x.GetByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TraineeInsights
            {
                Id = traineeId,
                Status = InsightsStatus.Ready,
                VisibleToAthlete = false,
                CreatedAt = DateTimeOffset.UtcNow,
                Strengths = [],
                Weaknesses = [],
                Recommendations = [],
            });

        var sut = CreateSut(
            traineeRepository: traineeRepository,
            traineeInsightsRepository: traineeInsightsRepository,
            userContext: userContext);

        var result = await sut.Handle(new GetTraineeInsightsQuery(traineeId), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenAthleteAndInsightsVisible_ReturnsInsights()
    {
        var athleteUserId = Guid.NewGuid();
        var coachUserId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(athleteUserId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, athleteUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = coachUserId,
                AthleteUserId = athleteUserId,
                Status = TraineeStatus.Active,
            });

        var traineeInsightsRepository = new Mock<ITraineeInsightsRepository>();
        traineeInsightsRepository
            .Setup(x => x.GetByTraineeId(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new TraineeInsights
            {
                Id = traineeId,
                Status = InsightsStatus.Ready,
                VisibleToAthlete = true,
                CreatedAt = DateTimeOffset.UtcNow,
                Strengths = [],
                Weaknesses = [],
                Recommendations = [],
            });

        var sut = CreateSut(
            traineeRepository: traineeRepository,
            traineeInsightsRepository: traineeInsightsRepository,
            userContext: userContext);

        var result = await sut.Handle(new GetTraineeInsightsQuery(traineeId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result.VisibleToAthlete);
    }
}
