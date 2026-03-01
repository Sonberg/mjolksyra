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
            Exercises =
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
            Order = SortOrder.Asc
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

        var sut = new GetPlannedWorkoutsRequestHandler(
            plannedWorkoutRepository.Object,
            exerciseRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(CreateRequest(traineeId), CancellationToken.None);

        Assert.Single(result.Data);
        Assert.NotNull(result.Next);
    }

    [Fact]
    public async Task Handle_WhenAthleteViewer_FiltersOutDraftExercisesAndEmptyWorkouts()
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
            Exercises =
            [
                new PlannedExercise
                {
                    Id = Guid.NewGuid(),
                    ExerciseId = publishedExerciseId,
                    Name = "Published",
                    IsPublished = true
                },
                new PlannedExercise
                {
                    Id = Guid.NewGuid(),
                    ExerciseId = Guid.NewGuid(),
                    Name = "Draft",
                    IsPublished = false
                }
            ]
        };

        var workoutWithDraftOnly = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 3, 2),
            CreatedAt = DateTimeOffset.UtcNow,
            Exercises =
            [
                new PlannedExercise
                {
                    Id = Guid.NewGuid(),
                    ExerciseId = Guid.NewGuid(),
                    Name = "Draft only",
                    IsPublished = false
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

        var sut = new GetPlannedWorkoutsRequestHandler(
            plannedWorkoutRepository.Object,
            exerciseRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(CreateRequest(traineeId), CancellationToken.None);

        Assert.Single(result.Data);
        var workout = Assert.Single(result.Data);
        var exercise = Assert.Single(workout.Exercises);
        Assert.True(exercise.IsPublished);
    }

    private static GetPlannedWorkoutsRequest CreateRequest(Guid? traineeId = null)
    {
        return new GetPlannedWorkoutsRequest
        {
            TraineeId = traineeId ?? Guid.NewGuid(),
            From = null,
            To = null,
            Cursor = null,
            Limit = 20,
            SortBy = null,
            Order = SortOrder.Asc
        };
    }
}
