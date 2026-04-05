using Moq;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class GenerateWorkoutPlanCommandHandlerTests
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
    public async Task Handle_WhenNotCoach_ReturnsNull()
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
                CoachUserId = Guid.NewGuid(),
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var sut = CreateSut(traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateCommand(traineeId: traineeId), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WithSkipStrategy_DoesNotOverwriteExistingWorkouts()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var existingDate = new DateOnly(2026, 4, 14);

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

        var existingWorkout = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            PlannedAt = existingDate,
            Exercises = [],
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [existingWorkout] });

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.GenerateAsync(It.IsAny<AIPlannerGenerateInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new AIPlannerWorkoutOutput
                {
                    PlannedAt = existingDate.ToString("yyyy-MM-dd"),
                    Name = "Leg Day",
                    Exercises = [],
                },
            ]);

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            plannedWorkoutRepository: plannedWorkoutRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(CreateCommand(traineeId: traineeId, conflictStrategy: "Skip"), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(0, result.WorkoutsCreated);
        plannedWorkoutRepository.Verify(
            x => x.Create(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_WithReplaceStrategy_DeletesExistingBeforeCreating()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var plannedDate = new DateOnly(2026, 4, 14);

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

        var existingId = Guid.NewGuid();
        var existingWorkout = new PlannedWorkout
        {
            Id = existingId,
            TraineeId = traineeId,
            PlannedAt = plannedDate,
            Exercises = [],
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [existingWorkout] });
        plannedWorkoutRepository
            .Setup(x => x.Create(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannedWorkout w, CancellationToken _) => w);

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.GenerateAsync(It.IsAny<AIPlannerGenerateInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new AIPlannerWorkoutOutput
                {
                    PlannedAt = plannedDate.ToString("yyyy-MM-dd"),
                    Name = "New Leg Day",
                    Exercises = [],
                },
            ]);

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            plannedWorkoutRepository: plannedWorkoutRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(CreateCommand(traineeId: traineeId, conflictStrategy: "Replace"), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(1, result.WorkoutsCreated);
        plannedWorkoutRepository.Verify(
            x => x.Delete(existingId, It.IsAny<CancellationToken>()),
            Times.Once);
        plannedWorkoutRepository.Verify(
            x => x.Create(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenAgentReturnsWorkouts_CreatesDrafts()
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

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [] });
        plannedWorkoutRepository
            .Setup(x => x.Create(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannedWorkout w, CancellationToken _) => w);

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.GenerateAsync(It.IsAny<AIPlannerGenerateInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new AIPlannerWorkoutOutput
                {
                    PlannedAt = "2026-04-14",
                    Name = "Upper Body",
                    Exercises =
                    [
                        new AIPlannerExerciseOutput
                        {
                            Name = "Bench Press",
                            PrescriptionType = "SetsReps",
                            Sets = [new AIPlannerSetOutput { Reps = 5, WeightKg = 80 }],
                        },
                    ],
                },
                new AIPlannerWorkoutOutput
                {
                    PlannedAt = "2026-04-16",
                    Name = "Lower Body",
                    Exercises = [],
                },
            ]);

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            plannedWorkoutRepository: plannedWorkoutRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(CreateCommand(traineeId: traineeId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(2, result.WorkoutsCreated);

        plannedWorkoutRepository.Verify(
            x => x.Create(
                It.Is<PlannedWorkout>(w => w.Exercises.All(e => !e.IsPublished)),
                It.IsAny<CancellationToken>()),
            Times.Exactly(2));
    }

    private static GenerateWorkoutPlanCommandHandler CreateSut(
        Mock<IAIWorkoutPlannerAgent>? plannerAgent = null,
        Mock<IPlannedWorkoutRepository>? plannedWorkoutRepository = null,
        Mock<IWorkoutMediaAnalysisRepository>? workoutMediaAnalysisRepository = null,
        Mock<IExerciseRepository>? exerciseRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null)
    {
        return new GenerateWorkoutPlanCommandHandler(
            (plannerAgent ?? new Mock<IAIWorkoutPlannerAgent>()).Object,
            (plannedWorkoutRepository ?? new Mock<IPlannedWorkoutRepository>()).Object,
            (workoutMediaAnalysisRepository ?? new Mock<IWorkoutMediaAnalysisRepository>()).Object,
            (exerciseRepository ?? new Mock<IExerciseRepository>()).Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object);
    }

    private static GenerateWorkoutPlanCommand CreateCommand(
        Guid? traineeId = null,
        string conflictStrategy = "Skip")
    {
        return new GenerateWorkoutPlanCommand
        {
            TraineeId = traineeId ?? Guid.NewGuid(),
            Description = "12-week strength program",
            Params = new GenerateWorkoutPlanParams
            {
                StartDate = "2026-04-14",
                NumberOfWeeks = 12,
                ConflictStrategy = conflictStrategy,
            },
        };
    }
}
