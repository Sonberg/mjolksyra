using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.GetLatestWorkoutMediaAnalysis;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class GetLatestWorkoutMediaAnalysisRequestHandlerTests
{
    [Fact]
    public async Task Handle_WhenLatestExists_ReturnsLatestAnalysis()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();
        var createdAt = DateTimeOffset.UtcNow;

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
                Status = Domain.Database.Enum.TraineeStatus.Active,
            });

        var workoutRepository = new Mock<IPlannedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 1),
                CreatedAt = DateTimeOffset.UtcNow,
                PublishedExercises = [],
            });

        var analysisRepository = new Mock<IWorkoutMediaAnalysisRepository>();
        analysisRepository
            .Setup(x => x.GetLatest(traineeId, workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new WorkoutMediaAnalysisRecord
            {
                Id = Guid.NewGuid(),
                TraineeId = traineeId,
                PlannedWorkoutId = workoutId,
                RequestedByUserId = userId,
                Text = "Review check-in",
                Summary = "Strong session.",
                KeyFindings = ["Depth remained consistent"],
                TechniqueRisks = ["Knees cave at fatigue"],
                CoachSuggestions = ["Cue feet screw into floor"],
                CreatedAt = createdAt,
            });

        var sut = new GetLatestWorkoutMediaAnalysisRequestHandler(
            workoutRepository.Object,
            traineeRepository.Object,
            userContext.Object,
            analysisRepository.Object);

        var result = await sut.Handle(new GetLatestWorkoutMediaAnalysisRequest
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId,
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Strong session.", result!.Summary);
        Assert.Equal(createdAt, result.CreatedAt);
    }

    [Fact]
    public async Task Handle_WhenLatestMissing_ReturnsNull()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();

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
                Status = Domain.Database.Enum.TraineeStatus.Active,
            });

        var workoutRepository = new Mock<IPlannedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 1),
                CreatedAt = DateTimeOffset.UtcNow,
                PublishedExercises = [],
            });

        var analysisRepository = new Mock<IWorkoutMediaAnalysisRepository>();
        analysisRepository
            .Setup(x => x.GetLatest(traineeId, workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((WorkoutMediaAnalysisRecord?)null);

        var sut = new GetLatestWorkoutMediaAnalysisRequestHandler(
            workoutRepository.Object,
            traineeRepository.Object,
            userContext.Object,
            analysisRepository.Object);

        var result = await sut.Handle(new GetLatestWorkoutMediaAnalysisRequest
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId,
        }, CancellationToken.None);

        Assert.Null(result);
    }
}
