using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.CompletedWorkouts.GetWorkouts;

namespace Mjolksyra.UseCases.Tests.CompletedWorkouts;

public class GetWorkoutsRequestHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserNotAuthenticated_ReturnsEmpty()
    {
        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);

        var sut = CreateSut(userContext: userContext);

        var result = await sut.Handle(CreateRequest(Guid.NewGuid()), CancellationToken.None);

        Assert.Empty(result.Data);
    }

    [Fact]
    public async Task Handle_WhenNoAccess_ReturnsEmpty()
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

        var result = await sut.Handle(CreateRequest(traineeId), CancellationToken.None);

        Assert.Empty(result.Data);
    }

    [Fact]
    public async Task Handle_ExcludesDraftOnlyWorkouts()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var draftOnlyWorkout = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            PublishedExercises = [],
            DraftExercises = [new PlannedExercise { Id = Guid.NewGuid(), Name = "Draft Only" }],
            PlannedAt = new DateOnly(2026, 5, 1),
            CreatedAt = DateTimeOffset.UtcNow
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [draftOnlyWorkout] });

        var sut = CreateSut(plannedWorkoutRepository: plannedWorkoutRepository, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateRequest(traineeId), CancellationToken.None);

        Assert.Empty(result.Data);
    }

    [Fact]
    public async Task Handle_IncludesWorkoutsWithPublishedExercises()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var publishedWorkout = new PlannedWorkout
        {
            Id = workoutId,
            TraineeId = traineeId,
            PublishedExercises = [new PlannedExercise { Id = Guid.NewGuid(), Name = "Squat", IsPublished = true }],
            PlannedAt = new DateOnly(2026, 5, 1),
            CreatedAt = DateTimeOffset.UtcNow
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [publishedWorkout] });

        var sut = CreateSut(plannedWorkoutRepository: plannedWorkoutRepository, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateRequest(traineeId), CancellationToken.None);

        Assert.Single(result.Data);
        Assert.Equal(workoutId, result.Data.First().PlannedWorkoutId);
    }

    [Fact]
    public async Task Handle_NeverReturnsDraftExercises()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var workout = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            PublishedExercises = [new PlannedExercise { Id = Guid.NewGuid(), Name = "Bench Press", IsPublished = true }],
            DraftExercises = [new PlannedExercise { Id = Guid.NewGuid(), Name = "Draft Exercise" }],
            PlannedAt = new DateOnly(2026, 5, 1),
            CreatedAt = DateTimeOffset.UtcNow
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [workout] });

        var sut = CreateSut(plannedWorkoutRepository: plannedWorkoutRepository, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateRequest(traineeId), CancellationToken.None);

        Assert.Single(result.Data);
        // Draft exercises are never included in the list response
        Assert.Single(result.Data.First().PrescribedExercises);
        Assert.Equal("Bench Press", result.Data.First().PrescribedExercises.First().Name);
    }

    private static GetWorkoutsRequestHandler CreateSut(
        Mock<IPlannedWorkoutRepository>? plannedWorkoutRepository = null,
        Mock<ICompletedWorkoutRepository>? completedWorkoutRepository = null,
        Mock<IExerciseRepository>? exerciseRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null)
    {
        var plannedWorkoutRepo = plannedWorkoutRepository ?? new Mock<IPlannedWorkoutRepository>();
        if (plannedWorkoutRepository is null)
        {
            plannedWorkoutRepo
                .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [] });
        }

        var completedWorkoutRepo = completedWorkoutRepository ?? new Mock<ICompletedWorkoutRepository>();
        if (completedWorkoutRepository is null)
        {
            completedWorkoutRepo
                .Setup(x => x.GetByPlannedWorkoutIds(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync([]);
        }

        var exerciseRepo = exerciseRepository ?? new Mock<IExerciseRepository>();
        if (exerciseRepository is null)
        {
            exerciseRepo
                .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync([]);
        }

        var traineeRepo = traineeRepository ?? new Mock<ITraineeRepository>();
        if (traineeRepository is null)
        {
            traineeRepo
                .Setup(x => x.HasAccess(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(false);
        }

        var userCtx = userContext ?? new Mock<IUserContext>();

        return new GetWorkoutsRequestHandler(
            plannedWorkoutRepo.Object,
            completedWorkoutRepo.Object,
            exerciseRepo.Object,
            traineeRepo.Object,
            userCtx.Object);
    }

    private static GetWorkoutsRequest CreateRequest(Guid traineeId)
    {
        return new GetWorkoutsRequest
        {
            TraineeId = traineeId,
            Cursor = null,
            Limit = 20,
            SortBy = null,
            Order = SortOrder.Asc,
        };
    }
}
