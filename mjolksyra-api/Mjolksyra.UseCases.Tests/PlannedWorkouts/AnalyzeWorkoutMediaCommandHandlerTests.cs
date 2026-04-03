using Moq;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class AnalyzeWorkoutMediaCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserNotAuthenticated_ReturnsNull()
    {
        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid?)null);

        var sut = CreateSut(userContext: userContext);

        var result = await sut.Handle(CreateCommand(), CancellationToken.None);

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

        var result = await sut.Handle(CreateCommand(traineeId: traineeId), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenWorkoutNotFound_ReturnsNull()
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

        var workoutRepository = new Mock<IPlannedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.Get(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannedWorkout?)null);

        var sut = CreateSut(workoutRepository, traineeRepository, userContext);

        var result = await sut.Handle(CreateCommand(traineeId: traineeId), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenAuthorized_ReturnsAnalysisResponse()
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

        var workoutRepository = new Mock<IPlannedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 1),
                CreatedAt = DateTimeOffset.UtcNow,
                Exercises = []
            });

        var analysisAgent = new Mock<IWorkoutMediaAnalysisAgent>();
        analysisAgent
            .Setup(x => x.AnalyzeAsync(It.IsAny<WorkoutMediaAnalysisInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new WorkoutMediaAnalysis
            {
                Summary = "Good control and tempo.",
                KeyFindings = ["Consistent depth"],
                TechniqueRisks = ["Minor knee valgus on last rep"],
                CoachSuggestions = ["Cue knees out on ascent"],
            });

        var analysisRepository = new Mock<IWorkoutMediaAnalysisRepository>();
        analysisRepository
            .Setup(x => x.Create(It.IsAny<WorkoutMediaAnalysisRecord>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((WorkoutMediaAnalysisRecord x, CancellationToken _) => x);

        var sut = CreateSut(workoutRepository, traineeRepository, userContext, analysisRepository, analysisAgent);

        var result = await sut.Handle(CreateCommand(traineeId, workoutId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("Good control and tempo.", result!.Summary);
        Assert.Single(result.KeyFindings);
        analysisAgent.Verify(
            x => x.AnalyzeAsync(
                It.Is<WorkoutMediaAnalysisInput>(input =>
                    input.Text == "Please review form" &&
                    input.MediaUrls.Count == 2),
                It.IsAny<CancellationToken>()),
            Times.Once);
        analysisRepository.Verify(
            x => x.Create(
                It.Is<WorkoutMediaAnalysisRecord>(record =>
                    record.TraineeId == traineeId &&
                    record.PlannedWorkoutId == workoutId &&
                    record.RequestedByUserId == userId),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    private static AnalyzeWorkoutMediaCommandHandler CreateSut(
        Mock<IPlannedWorkoutRepository>? workoutRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null,
        Mock<IWorkoutMediaAnalysisRepository>? analysisRepository = null,
        Mock<IWorkoutMediaAnalysisAgent>? analysisAgent = null)
    {
        return new AnalyzeWorkoutMediaCommandHandler(
            (workoutRepository ?? new Mock<IPlannedWorkoutRepository>()).Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object,
            (analysisRepository ?? new Mock<IWorkoutMediaAnalysisRepository>()).Object,
            (analysisAgent ?? new Mock<IWorkoutMediaAnalysisAgent>()).Object);
    }

    private static AnalyzeWorkoutMediaCommand CreateCommand(Guid? traineeId = null, Guid? workoutId = null)
    {
        return new AnalyzeWorkoutMediaCommand
        {
            TraineeId = traineeId ?? Guid.NewGuid(),
            PlannedWorkoutId = workoutId ?? Guid.NewGuid(),
            Analysis = new WorkoutMediaAnalysisRequest
            {
                Text = "Please review form",
                MediaUrls = ["https://utfs.io/f/clip.mp4", "https://utfs.io/f/photo.jpg"]
            }
        };
    }
}
