using Moq;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.ClarifyWorkoutPlan;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class ClarifyWorkoutPlanQueryHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserNotAuthenticated_ReturnsNull()
    {
        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid?)null);

        var sut = CreateSut(userContext: userContext);

        var result = await sut.Handle(CreateQuery(), CancellationToken.None);

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

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenAgentReturnsFollowUpQuestion_ReturnsClarification()
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

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.ClarifyAsync(It.IsAny<AIPlannerClarifyInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AIPlannerClarifyOutput
            {
                Message = "What start date are you targeting?",
                IsReadyToGenerate = false,
            });

        var sut = CreateSut(plannerAgent: plannerAgent, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("What start date are you targeting?", result.Message);
        Assert.False(result.IsReadyToGenerate);
        Assert.Null(result.SuggestedParams);
    }

    [Fact]
    public async Task Handle_WhenAgentIsReadyToGenerate_ReturnsSuggestedParams()
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

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.ClarifyAsync(It.IsAny<AIPlannerClarifyInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AIPlannerClarifyOutput
            {
                Message = "Ready to generate your 8-week program.",
                IsReadyToGenerate = true,
                SuggestedParams = new AIPlannerSuggestedParams
                {
                    StartDate = "2026-04-14",
                    NumberOfWeeks = 8,
                    ConflictStrategy = "Skip",
                },
            });

        var sut = CreateSut(plannerAgent: plannerAgent, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result.IsReadyToGenerate);
        Assert.NotNull(result.SuggestedParams);
        Assert.Equal("2026-04-14", result.SuggestedParams.StartDate);
        Assert.Equal(8, result.SuggestedParams.NumberOfWeeks);
        Assert.Equal("Skip", result.SuggestedParams.ConflictStrategy);
    }

    [Fact]
    public async Task Handle_WhenWorkoutRemovalToolRuns_MarksWorkoutsChanged()
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

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.ClarifyAsync(It.IsAny<AIPlannerClarifyInput>(), It.IsAny<CancellationToken>()))
            .Returns<AIPlannerClarifyInput, CancellationToken>(async (input, ct) =>
            {
                await input.ToolDispatcher.RemoveUpcomingWorkoutsAsync("2026-04-06", 42, ct);
                return new AIPlannerClarifyOutput
                {
                    Message = "Removed 1 workout.",
                    WorkoutsChanged = true,
                };
            });

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data =
                [
                    new PlannedWorkout
                    {
                        Id = Guid.NewGuid(),
                        TraineeId = traineeId,
                        PlannedAt = new DateOnly(2026, 4, 7),
                        Exercises = [],
                        CreatedAt = DateTimeOffset.UtcNow,
                    },
                ],
            });

        var deletedPublisher = new Mock<IPlannedWorkoutDeletedPublisher>();

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            plannedWorkoutRepository: plannedWorkoutRepository,
            deletedPublisher: deletedPublisher,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result.WorkoutsChanged);
        plannedWorkoutRepository.Verify(x => x.Delete(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Once);
        deletedPublisher.Verify(x => x.Publish(It.IsAny<PlannedWorkoutDeletedMessage>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    private static ClarifyWorkoutPlanQueryHandler CreateSut(
        Mock<IAIWorkoutPlannerAgent>? plannerAgent = null,
        Mock<IPlannedWorkoutRepository>? plannedWorkoutRepository = null,
        Mock<IWorkoutMediaAnalysisRepository>? workoutMediaAnalysisRepository = null,
        Mock<IExerciseRepository>? exerciseRepository = null,
        Mock<IPlannedWorkoutDeletedPublisher>? deletedPublisher = null,
        Mock<IAIPlannerSessionRepository>? sessionRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null)
    {
        var workoutRepo = plannedWorkoutRepository ?? new Mock<IPlannedWorkoutRepository>();
        if (plannedWorkoutRepository is null)
        {
            workoutRepo
                .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [] });
        }

        var sessionRepo = sessionRepository ?? new Mock<IAIPlannerSessionRepository>();
        if (sessionRepository is null)
        {
            sessionRepo
                .Setup(x => x.Create(It.IsAny<AIPlannerSession>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((AIPlannerSession s, CancellationToken _) => s);
        }

        return new ClarifyWorkoutPlanQueryHandler(
            (plannerAgent ?? new Mock<IAIWorkoutPlannerAgent>()).Object,
            workoutRepo.Object,
            (workoutMediaAnalysisRepository ?? new Mock<IWorkoutMediaAnalysisRepository>()).Object,
            (exerciseRepository ?? new Mock<IExerciseRepository>()).Object,
            (deletedPublisher ?? new Mock<IPlannedWorkoutDeletedPublisher>()).Object,
            sessionRepo.Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object);
    }

    private static ClarifyWorkoutPlanQuery CreateQuery(Guid? traineeId = null)
    {
        return new ClarifyWorkoutPlanQuery
        {
            TraineeId = traineeId ?? Guid.NewGuid(),
            Description = "12-week strength program for a powerlifter",
        };
    }
}
