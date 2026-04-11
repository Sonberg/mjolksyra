using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkouts;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class GetPlannedWorkoutsRequestHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserMissing_ReturnsEmpty()
    {
        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);

        var sut = new GetPlannedWorkoutsRequestHandler(
            Mock.Of<IPlannedWorkoutRepository>(),
            Mock.Of<IExerciseRepository>(),
            Mock.Of<ITraineeRepository>(),
            Mock.Of<ICompletedWorkoutRepository>(),
            userContext.Object);

        var result = await sut.Handle(CreateRequest(), CancellationToken.None);

        Assert.Empty(result.Data);
        Assert.Null(result.Next);
    }

    [Fact]
    public async Task Handle_WhenAccessAllowed_ReturnsMappedWorkouts()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var exerciseId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var plannedWorkout = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            Name = "Workout",
            Note = null,
            PlannedAt = new DateOnly(2026, 2, 2),
            PublishedExercises =
            [
                new PlannedExercise
                {
                    Id = Guid.NewGuid(),
                    ExerciseId = exerciseId,
                    Name = "Exercise",
                    Note = null
                }
            ],
            CreatedAt = DateTimeOffset.UtcNow
        };

        var cursor = new PlannedWorkoutCursor
        {
            Page = 0,
            Size = 20,
            TraineeId = traineeId,
            FromDate = null,
            ToDate = null,
            SortBy = null,
            Order = SortOrder.Asc,
            DraftOnly = false
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data = [plannedWorkout],
                Cursor = cursor
            });

        var exerciseRepository = new Mock<IExerciseRepository>();
        exerciseRepository
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(
            [
                new Exercise
                {
                    Id = exerciseId,
                    Name = "Exercise",
                    CreatedAt = DateTimeOffset.UtcNow
                }
            ]);

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.GetByPlannedWorkoutIds(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var sut = new GetPlannedWorkoutsRequestHandler(
            plannedWorkoutRepository.Object,
            exerciseRepository.Object,
            traineeRepository.Object,
            completedWorkoutRepository.Object,
            userContext.Object);

        var result = await sut.Handle(CreateRequest(traineeId), CancellationToken.None);

        Assert.Single(result.Data);
        Assert.NotNull(result.Next);
    }

    [Fact]
    public async Task Handle_WhenDraftOnlyRequest_UsesDraftOnlyCursor()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        PlannedWorkoutCursor? capturedCursor = null;
        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .Callback<PlannedWorkoutCursor, CancellationToken>((cursor, _) => capturedCursor = cursor)
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data = [],
                Cursor = null
            });

        var sut = new GetPlannedWorkoutsRequestHandler(
            plannedWorkoutRepository.Object,
            Mock.Of<IExerciseRepository>(),
            traineeRepository.Object,
            Mock.Of<ICompletedWorkoutRepository>(),
            userContext.Object);

        await sut.Handle(CreateRequest(traineeId, draftOnly: true), CancellationToken.None);

        Assert.NotNull(capturedCursor);
        Assert.True(capturedCursor.DraftOnly);
        Assert.Equal(traineeId, capturedCursor.TraineeId);
    }

    [Fact]
    public async Task Handle_WhenAthleteViewer_ReturnsOnlyPublishedExercisesAndFiltersEmptyWorkouts()
    {
        var athleteUserId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var publishedExerciseId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(athleteUserId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.HasAccess(traineeId, athleteUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository.Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                AthleteUserId = athleteUserId,
                CoachUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active
            });

        var workoutWithPublished = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 3, 1),
            CreatedAt = DateTimeOffset.UtcNow,
            PublishedExercises =
            [
                new PlannedExercise
                {
                    Id = Guid.NewGuid(),
                    ExerciseId = publishedExerciseId,
                    Name = "Published",
                }
            ],
            DraftExercises =
            [
                new PlannedExercise
                {
                    Id = Guid.NewGuid(),
                    ExerciseId = Guid.NewGuid(),
                    Name = "Draft",
                }
            ]
        };

        var workoutWithDraftOnly = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 3, 2),
            CreatedAt = DateTimeOffset.UtcNow,
            PublishedExercises = [],
            DraftExercises =
            [
                new PlannedExercise
                {
                    Id = Guid.NewGuid(),
                    ExerciseId = Guid.NewGuid(),
                    Name = "Draft only",
                }
            ]
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data = [workoutWithPublished, workoutWithDraftOnly],
                Cursor = null
            });

        var exerciseRepository = new Mock<IExerciseRepository>();
        exerciseRepository
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(
            [
                new Exercise
                {
                    Id = publishedExerciseId,
                    Name = "Published",
                    CreatedAt = DateTimeOffset.UtcNow
                }
            ]);

        var completedWorkoutRepository2 = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository2
            .Setup(x => x.GetByPlannedWorkoutIds(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var sut = new GetPlannedWorkoutsRequestHandler(
            plannedWorkoutRepository.Object,
            exerciseRepository.Object,
            traineeRepository.Object,
            completedWorkoutRepository2.Object,
            userContext.Object);

        var result = await sut.Handle(CreateRequest(traineeId), CancellationToken.None);

        Assert.Single(result.Data);
        var workout = Assert.Single(result.Data);
        Assert.Single(workout.PublishedExercises);
        Assert.Null(workout.DraftExercises);
    }

    [Fact]
    public async Task Handle_WhenPlannedWorkoutHasCompletedSession_ExcludesItFromNormalFeed()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var benchId = Guid.NewGuid();
        var squatId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var completedPlannedWorkout = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 3, 1),
            CreatedAt = DateTimeOffset.UtcNow,
            PublishedExercises = [new PlannedExercise { Id = Guid.NewGuid(), ExerciseId = benchId, Name = "Bench" }]
        };

        var activePlannedWorkout = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 3, 2),
            CreatedAt = DateTimeOffset.UtcNow,
            PublishedExercises = [new PlannedExercise { Id = Guid.NewGuid(), ExerciseId = squatId, Name = "Squat" }]
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data = [completedPlannedWorkout, activePlannedWorkout],
                Cursor = null
            });

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.GetByPlannedWorkoutIds(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(
            [
                new CompletedWorkout
                {
                    Id = Guid.NewGuid(),
                    PlannedWorkoutId = completedPlannedWorkout.Id,
                    TraineeId = traineeId,
                    PlannedAt = completedPlannedWorkout.PlannedAt,
                    CompletedAt = DateTimeOffset.UtcNow,
                    CreatedAt = DateTimeOffset.UtcNow
                },
                new CompletedWorkout
                {
                    Id = Guid.NewGuid(),
                    PlannedWorkoutId = activePlannedWorkout.Id,
                    TraineeId = traineeId,
                    PlannedAt = activePlannedWorkout.PlannedAt,
                    CompletedAt = null,
                    CreatedAt = DateTimeOffset.UtcNow
                }
            ]);

        var exerciseRepository = new Mock<IExerciseRepository>();
        exerciseRepository
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(
            [
                new Exercise { Id = benchId, Name = "Bench", CreatedAt = DateTimeOffset.UtcNow },
                new Exercise { Id = squatId, Name = "Squat", CreatedAt = DateTimeOffset.UtcNow }
            ]);

        var sut = new GetPlannedWorkoutsRequestHandler(
            plannedWorkoutRepository.Object,
            exerciseRepository.Object,
            traineeRepository.Object,
            completedWorkoutRepository.Object,
            userContext.Object);

        var result = await sut.Handle(CreateRequest(traineeId), CancellationToken.None);

        var workout = Assert.Single(result.Data);
        Assert.Equal(activePlannedWorkout.Id, workout.Id);
        Assert.True(workout.HasActiveSession);
    }

    [Fact]
    public async Task Handle_WhenDraftOnlyRequest_DoesNotExcludeWorkoutWithCompletedSession()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var draftExerciseId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var draftWorkout = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 3, 1),
            CreatedAt = DateTimeOffset.UtcNow,
            PublishedExercises = [],
            DraftExercises = [new PlannedExercise { Id = Guid.NewGuid(), ExerciseId = draftExerciseId, Name = "Draft only" }]
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data = [draftWorkout],
                Cursor = null
            });

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.GetByPlannedWorkoutIds(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(
            [
                new CompletedWorkout
                {
                    Id = Guid.NewGuid(),
                    PlannedWorkoutId = draftWorkout.Id,
                    TraineeId = traineeId,
                    PlannedAt = draftWorkout.PlannedAt,
                    CompletedAt = DateTimeOffset.UtcNow,
                    CreatedAt = DateTimeOffset.UtcNow
                }
            ]);

        var exerciseRepository = new Mock<IExerciseRepository>();
        exerciseRepository
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(
            [
                new Exercise { Id = draftExerciseId, Name = "Draft only", CreatedAt = DateTimeOffset.UtcNow }
            ]);

        var sut = new GetPlannedWorkoutsRequestHandler(
            plannedWorkoutRepository.Object,
            exerciseRepository.Object,
            traineeRepository.Object,
            completedWorkoutRepository.Object,
            userContext.Object);

        var result = await sut.Handle(CreateRequest(traineeId, draftOnly: true), CancellationToken.None);

        var workout = Assert.Single(result.Data);
        Assert.Equal(draftWorkout.Id, workout.Id);
    }

    private static GetPlannedWorkoutsRequest CreateRequest(Guid? traineeId = null, bool draftOnly = false)
    {
        return new GetPlannedWorkoutsRequest
        {
            TraineeId = traineeId ?? Guid.NewGuid(),
            From = null,
            To = null,
            Cursor = null,
            Limit = 20,
            SortBy = null,
            Order = SortOrder.Asc,
            DraftOnly = draftOnly
        };
    }
}
