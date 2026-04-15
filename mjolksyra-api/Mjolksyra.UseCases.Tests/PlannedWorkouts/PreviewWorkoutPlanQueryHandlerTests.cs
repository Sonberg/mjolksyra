using Moq;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.PreviewWorkoutPlan;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class PreviewWorkoutPlanQueryHandlerTests
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
    public async Task Handle_WhenTraineeNotFound_ReturnsNull()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee?)null);

        var sut = CreateSut(traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenTraineeBelongsToAnotherCoach_ReturnsNull()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = Guid.NewGuid(), // different coach
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var sut = CreateSut(traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenAgentReturnsWorkouts_ReturnsMappedPreview()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

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

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.GenerateAsync(It.IsAny<AIPlannerGenerateInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AIPlannerWorkoutOutput>
            {
                new()
                {
                    PlannedAt = "2026-04-14",
                    Name = "Squat Day",
                    Exercises =
                    [
                        new AIPlannerExerciseOutput
                        {
                            Name = "Squat",
                            PrescriptionType = "SetsReps",
                            Sets =
                            [
                                new AIPlannerSetOutput { Reps = 5, WeightKg = 100 },
                                new AIPlannerSetOutput { Reps = 5, WeightKg = 100 },
                            ],
                        },
                    ],
                },
                new()
                {
                    PlannedAt = "2026-04-16",
                    Name = "Bench Day",
                    Exercises =
                    [
                        new AIPlannerExerciseOutput
                        {
                            Name = "Bench Press",
                            PrescriptionType = "SetsReps",
                            Sets = [new AIPlannerSetOutput { Reps = 8, WeightKg = 80 }],
                        },
                    ],
                },
            });

        var sut = CreateSut(plannerAgent: plannerAgent, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(2, result.Workouts.Count);

        var first = result.Workouts.First();
        Assert.Equal("2026-04-14", first.PlannedAt);
        Assert.Equal("Squat Day", first.Name);
        Assert.Single(first.Exercises);
        Assert.Equal("Squat", first.Exercises.First().Name);
        Assert.Equal("SetsReps", first.Exercises.First().PrescriptionType);
        Assert.Equal(2, first.Exercises.First().Sets.Count);
        Assert.Equal(5, first.Exercises.First().Sets.First().Reps);
        Assert.Equal(100, first.Exercises.First().Sets.First().WeightKg);
    }

    [Fact]
    public async Task Handle_WhenAgentReturnsNoWorkouts_ReturnsEmptyList()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

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

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.GenerateAsync(It.IsAny<AIPlannerGenerateInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AIPlannerWorkoutOutput>());

        var sut = CreateSut(plannerAgent: plannerAgent, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Empty(result.Workouts);
    }

    [Fact]
    public async Task Handle_DoesNotPersistAnyWorkouts()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

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

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.GenerateAsync(It.IsAny<AIPlannerGenerateInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<AIPlannerWorkoutOutput>
            {
                new() { PlannedAt = "2026-04-14", Exercises = [] },
            });

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            plannedWorkoutRepository: plannedWorkoutRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        plannedWorkoutRepository.Verify(
            x => x.Create(It.IsAny<Domain.Database.Models.PlannedWorkout>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    private static PreviewWorkoutPlanQueryHandler CreateSut(
        Mock<IAIWorkoutPlannerAgent>? plannerAgent = null,
        Mock<IPlannedWorkoutRepository>? plannedWorkoutRepository = null,
        Mock<IWorkoutMediaAnalysisRepository>? workoutMediaAnalysisRepository = null,
        Mock<IExerciseRepository>? exerciseRepository = null,
        Mock<IPlannedWorkoutDeletedPublisher>? deletedPublisher = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null)
    {
        return new PreviewWorkoutPlanQueryHandler(
            (plannerAgent ?? new Mock<IAIWorkoutPlannerAgent>()).Object,
            (plannedWorkoutRepository ?? new Mock<IPlannedWorkoutRepository>()).Object,
            new Mock<ICompletedWorkoutRepository>().Object,
            (workoutMediaAnalysisRepository ?? new Mock<IWorkoutMediaAnalysisRepository>()).Object,
            (exerciseRepository ?? new Mock<IExerciseRepository>()).Object,
            (deletedPublisher ?? new Mock<IPlannedWorkoutDeletedPublisher>()).Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            new Mock<ITraineeInsightsRepository>().Object,
            new Mock<ICoachInsightsRepository>().Object,
            (userContext ?? new Mock<IUserContext>()).Object);
    }

    private static PreviewWorkoutPlanQuery CreateQuery(Guid? traineeId = null)
    {
        return new PreviewWorkoutPlanQuery
        {
            TraineeId = traineeId ?? Guid.NewGuid(),
            Description = "8-week strength program for a powerlifter",
            Params = new PreviewWorkoutPlanParams
            {
                StartDate = "2026-04-14",
                NumberOfWeeks = 8,
                ConflictStrategy = "Skip",
            },
        };
    }
}
