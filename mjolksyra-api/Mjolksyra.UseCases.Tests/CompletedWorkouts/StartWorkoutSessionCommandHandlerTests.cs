using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.CompletedWorkouts.StartWorkoutSession;

namespace Mjolksyra.UseCases.Tests.CompletedWorkouts;

public class StartWorkoutSessionCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserNotAuthenticated_ReturnsNull()
    {
        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);

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
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var sut = CreateSut(traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(new StartWorkoutSessionCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = Guid.NewGuid()
        }, CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenSessionAlreadyExists_ReturnsExistingSession()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();
        var existingSessionId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var plannedWorkout = new PlannedWorkout
        {
            Id = workoutId,
            TraineeId = traineeId,
            PublishedExercises = [new PlannedExercise { Id = Guid.NewGuid(), Name = "Squat", IsPublished = true }],
            PlannedAt = new DateOnly(2026, 5, 1),
            CreatedAt = DateTimeOffset.UtcNow
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository.Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>())).ReturnsAsync(plannedWorkout);

        var existingSession = new CompletedWorkout
        {
            Id = existingSessionId,
            PlannedWorkoutId = workoutId,
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 5, 1),
            Exercises = [new CompletedExercise { Id = Guid.NewGuid(), Name = "Already In Session" }],
            CreatedAt = DateTimeOffset.UtcNow
        };

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.GetByPlannedWorkoutId(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingSession);

        var sut = CreateSut(
            plannedWorkoutRepository: plannedWorkoutRepository,
            completedWorkoutRepository: completedWorkoutRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(new StartWorkoutSessionCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(result.Session);
        Assert.Equal(existingSessionId, result.Session!.Id);
        Assert.Single(result.Session.Exercises);
        Assert.Equal("Already In Session", result.Session.Exercises.First().Name);

        // Must not create a new session
        completedWorkoutRepository.Verify(x => x.Create(It.IsAny<CompletedWorkout>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenNoExistingSession_CreatesSessionFromPublishedExercises()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();
        var exerciseId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var publishedExercise = new PlannedExercise
        {
            Id = exerciseId,
            Name = "Back Squat",
            IsPublished = true,
            AddedBy = ExerciseAddedBy.Coach,
            Prescription = new ExercisePrescription
            {
                Type = ExerciseType.SetsReps,
                Sets =
                [
                    new ExercisePrescriptionSet
                    {
                        Target = new ExercisePrescriptionSetTarget { Reps = 5, WeightKg = 100 },
                        Actual = new ExercisePrescriptionSetActual { Reps = 4, WeightKg = 90, IsDone = true }
                    }
                ]
            }
        };

        var plannedWorkout = new PlannedWorkout
        {
            Id = workoutId,
            TraineeId = traineeId,
            PublishedExercises = [publishedExercise],
            DraftExercises = [new PlannedExercise { Id = Guid.NewGuid(), Name = "Draft Only", IsPublished = false }],
            PlannedAt = new DateOnly(2026, 5, 1),
            CreatedAt = DateTimeOffset.UtcNow
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository.Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>())).ReturnsAsync(plannedWorkout);

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.GetByPlannedWorkoutId(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((CompletedWorkout?)null);
        completedWorkoutRepository
            .Setup(x => x.Create(It.IsAny<CompletedWorkout>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((CompletedWorkout session, CancellationToken _) => session);

        var sut = CreateSut(
            plannedWorkoutRepository: plannedWorkoutRepository,
            completedWorkoutRepository: completedWorkoutRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(new StartWorkoutSessionCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(workoutId, result.PlannedWorkoutId);
        Assert.NotEqual(workoutId, result.Id); // Id is CompletedWorkout.Id, not PlannedWorkout.Id
        Assert.Equal(traineeId, result.TraineeId);
        Assert.NotNull(result.Session);

        // Only published exercises, not draft
        Assert.Single(result.Session!.Exercises);
        Assert.Equal("Back Squat", result.Session.Exercises.First().Name);

        // Actual values cleared on initialization
        var set = result.Session.Exercises.First().Prescription?.Sets?.First();
        Assert.NotNull(set);
        Assert.Null(set!.Actual);

        completedWorkoutRepository.Verify(x => x.Create(It.IsAny<CompletedWorkout>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    private static StartWorkoutSessionCommandHandler CreateSut(
        Mock<IPlannedWorkoutRepository>? plannedWorkoutRepository = null,
        Mock<ICompletedWorkoutRepository>? completedWorkoutRepository = null,
        Mock<IExerciseRepository>? exerciseRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null)
    {
        var exerciseRepo = exerciseRepository ?? new Mock<IExerciseRepository>();
        exerciseRepo
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        return new StartWorkoutSessionCommandHandler(
            (plannedWorkoutRepository ?? new Mock<IPlannedWorkoutRepository>()).Object,
            (completedWorkoutRepository ?? new Mock<ICompletedWorkoutRepository>()).Object,
            exerciseRepo.Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object);
    }

    private static StartWorkoutSessionCommand CreateCommand()
    {
        return new StartWorkoutSessionCommand
        {
            TraineeId = Guid.NewGuid(),
            PlannedWorkoutId = Guid.NewGuid()
        };
    }
}
