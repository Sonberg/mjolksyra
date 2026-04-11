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
    public async Task Handle_ReturnsCompletedWorkoutResponses()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var completedWorkoutId = Guid.NewGuid();
        var exerciseId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<CompletedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<CompletedWorkout>
            {
                Data =
                [
                    new CompletedWorkout
                    {
                        Id = completedWorkoutId,
                        PlannedWorkoutId = null,
                        TraineeId = traineeId,
                        PlannedAt = new DateOnly(2026, 5, 1),
                        CompletedAt = DateTimeOffset.UtcNow,
                        CreatedAt = DateTimeOffset.UtcNow,
                        Exercises =
                        [
                            new CompletedExercise
                            {
                                Id = Guid.NewGuid(),
                                ExerciseId = exerciseId,
                                Name = "Bench Press",
                            }
                        ]
                    }
                ],
                Cursor = null
            });

        var exerciseRepository = new Mock<IExerciseRepository>();
        exerciseRepository
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(
            [
                new Exercise
                {
                    Id = exerciseId,
                    Name = "Bench Press",
                }
            ]);

        var sut = CreateSut(
            completedWorkoutRepository: completedWorkoutRepository,
            exerciseRepository: exerciseRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(CreateRequest(traineeId), CancellationToken.None);

        Assert.Single(result.Data);
        Assert.Equal(completedWorkoutId, result.Data.First().Id);
        Assert.Null(result.Data.First().PlannedWorkoutId);
        Assert.Single(result.Data.First().Exercises);
        Assert.Equal("Bench Press", result.Data.First().Exercises.First().Name);
    }

    private static GetWorkoutsRequestHandler CreateSut(
        Mock<ICompletedWorkoutRepository>? completedWorkoutRepository = null,
        Mock<IExerciseRepository>? exerciseRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null)
    {
        var completedWorkoutRepo = completedWorkoutRepository ?? new Mock<ICompletedWorkoutRepository>();
        if (completedWorkoutRepository is null)
        {
            completedWorkoutRepo
                .Setup(x => x.Get(It.IsAny<CompletedWorkoutCursor>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new Paginated<CompletedWorkout> { Data = [] });
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

        return new GetWorkoutsRequestHandler(
            completedWorkoutRepo.Object,
            exerciseRepo.Object,
            traineeRepo.Object,
            (userContext ?? new Mock<IUserContext>()).Object);
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
