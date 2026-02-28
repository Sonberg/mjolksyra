using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkout;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class GetPlannedWorkoutRequestHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserMissing_ReturnsNull()
    {
        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);

        var sut = new GetPlannedWorkoutRequestHandler(
            Mock.Of<IPlannedWorkoutRepository>(),
            Mock.Of<IExerciseRepository>(),
            Mock.Of<ITraineeRepository>(),
            userContext.Object);

        var result = await sut.Handle(CreateRequest(), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenUserHasNoAccess_ReturnsNull()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var sut = new GetPlannedWorkoutRequestHandler(
            Mock.Of<IPlannedWorkoutRepository>(),
            Mock.Of<IExerciseRepository>(),
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(CreateRequest(traineeId), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenFoundAndAccessible_ReturnsMappedWorkout()
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

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 2, 28),
                Exercises =
                [
                    new PlannedExercise
                    {
                        Id = Guid.NewGuid(),
                        ExerciseId = exerciseId,
                        Name = "Bench press",
                        Note = "3x5"
                    }
                ],
                CreatedAt = DateTimeOffset.UtcNow
            });

        var exerciseRepository = new Mock<IExerciseRepository>();
        exerciseRepository
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(
            [
                new Exercise
                {
                    Id = exerciseId,
                    Name = "Bench press",
                    CreatedAt = DateTimeOffset.UtcNow
                }
            ]);

        var sut = new GetPlannedWorkoutRequestHandler(
            plannedWorkoutRepository.Object,
            exerciseRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(
            CreateRequest(traineeId, workoutId),
            CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(workoutId, result.Id);
        Assert.Equal(traineeId, result.TraineeId);
        Assert.Single(result.Exercises);
    }

    private static GetPlannedWorkoutRequest CreateRequest(Guid? traineeId = null, Guid? plannedWorkoutId = null)
    {
        return new GetPlannedWorkoutRequest
        {
            TraineeId = traineeId ?? Guid.NewGuid(),
            PlannedWorkoutId = plannedWorkoutId ?? Guid.NewGuid()
        };
    }
}
