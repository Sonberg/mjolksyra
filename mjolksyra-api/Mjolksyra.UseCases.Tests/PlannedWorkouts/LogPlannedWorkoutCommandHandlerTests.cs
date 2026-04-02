using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.UseCases.PlannedWorkouts.LogPlannedWorkout;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class LogPlannedWorkoutCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenWorkoutNotFound_ReturnsNull()
    {
        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannedWorkout?)null);

        var sut = CreateSut(plannedWorkoutRepository);

        var result = await sut.Handle(CreateCommand(), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_SetsCompletedAt_WhenCompletedAtProvided()
    {
        var workoutId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var plannedWorkout = new PlannedWorkout
        {
            Id = workoutId,
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 3, 15),
            Exercises = [],
            CreatedAt = DateTimeOffset.UtcNow
        };

        PlannedWorkout? savedWorkout = null;
        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plannedWorkout);
        plannedWorkoutRepository
            .Setup(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()))
            .Callback<PlannedWorkout, CancellationToken>((w, _) => savedWorkout = w);

        var exerciseRepository = new Mock<IExerciseRepository>();
        exerciseRepository
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var sut = CreateSut(plannedWorkoutRepository, exerciseRepository);

        var result = await sut.Handle(
            CreateCommand(workoutId, traineeId),
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(savedWorkout);
        Assert.NotNull(savedWorkout!.CompletedAt);
    }

    [Fact]
    public async Task Handle_WhenWorkoutAlreadyCompleted_StillReturnsWorkout()
    {
        var workoutId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var plannedWorkout = new PlannedWorkout
        {
            Id = workoutId,
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 3, 15),
            Exercises = [],
            CreatedAt = DateTimeOffset.UtcNow,
            CompletedAt = DateTimeOffset.UtcNow.AddDays(-1),
        };

        PlannedWorkout? savedWorkout = null;
        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(plannedWorkout);
        plannedWorkoutRepository
            .Setup(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()))
            .Callback<PlannedWorkout, CancellationToken>((w, _) => savedWorkout = w);

        var exerciseRepository = new Mock<IExerciseRepository>();
        exerciseRepository
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var sut = CreateSut(plannedWorkoutRepository, exerciseRepository);

        var result = await sut.Handle(
            CreateCommand(workoutId, traineeId),
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(savedWorkout);
        Assert.NotNull(savedWorkout!.CompletedAt);
    }

    private static LogPlannedWorkoutCommandHandler CreateSut(
        Mock<IPlannedWorkoutRepository>? plannedWorkoutRepository = null,
        Mock<IExerciseRepository>? exerciseRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<INotificationService>? notificationService = null)
    {
        return new LogPlannedWorkoutCommandHandler(
            (plannedWorkoutRepository ?? new Mock<IPlannedWorkoutRepository>()).Object,
            (exerciseRepository ?? new Mock<IExerciseRepository>()).Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (notificationService ?? new Mock<INotificationService>()).Object);
    }

    private static LogPlannedWorkoutCommand CreateCommand(
        Guid? workoutId = null,
        Guid? traineeId = null,
        ICollection<string>? mediaUrls = null)
    {
        return new LogPlannedWorkoutCommand
        {
            PlannedWorkoutId = workoutId ?? Guid.NewGuid(),
            TraineeId = traineeId ?? Guid.NewGuid(),
            Log = new LogPlannedWorkoutRequest
            {
                CompletedAt = DateTimeOffset.UtcNow,
                MediaUrls = mediaUrls ?? [],
                Exercises = []
            }
        };
    }
}
