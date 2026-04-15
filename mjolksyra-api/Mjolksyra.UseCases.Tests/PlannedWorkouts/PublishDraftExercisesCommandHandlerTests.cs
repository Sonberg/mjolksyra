using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.PublishDraftExercises;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class PublishDraftExercisesCommandHandlerTests
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
    public async Task Handle_WhenNotCoach_ReturnsNull()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                AthleteUserId = Guid.NewGuid(),
                CoachUserId = Guid.NewGuid(),
                Status = Domain.Database.Enum.TraineeStatus.Active
            });

        var sut = CreateSut(traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(new PublishDraftExercisesCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = Guid.NewGuid()
        }, CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenNoDraftExercises_ReturnsCurrentState()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                AthleteUserId = Guid.NewGuid(),
                CoachUserId = userId,
                Status = Domain.Database.Enum.TraineeStatus.Active
            });

        var workout = new PlannedWorkout
        {
            Id = workoutId,
            TraineeId = traineeId,
            PublishedExercises = [new PlannedExercise { Id = Guid.NewGuid(), Name = "Existing", IsPublished = true }],
            DraftExercises = null,
            PlannedAt = new DateOnly(2026, 5, 1),
            CreatedAt = DateTimeOffset.UtcNow
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository.Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>())).ReturnsAsync(workout);

        var sut = CreateSut(plannedWorkoutRepository: plannedWorkoutRepository, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(new PublishDraftExercisesCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId
        }, CancellationToken.None);

        Assert.NotNull(result);
        // No update called since no draft to publish
        plannedWorkoutRepository.Verify(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WithDraftExercises_MovesDraftToPublishedAndClearsDraft()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                AthleteUserId = Guid.NewGuid(),
                CoachUserId = userId,
                Status = Domain.Database.Enum.TraineeStatus.Active
            });

        var draftExercise = new PlannedExercise
        {
            Id = Guid.NewGuid(),
            Name = "Draft Squat",
            IsPublished = false,
            AddedBy = ExerciseAddedBy.Coach,
            Prescription = new ExercisePrescription
            {
                Type = ExerciseType.SetsReps,
                Sets = [new ExercisePrescriptionSet { Target = new ExercisePrescriptionSetTarget { Reps = 5, WeightKg = 100 } }]
            }
        };

        var workout = new PlannedWorkout
        {
            Id = workoutId,
            TraineeId = traineeId,
            PublishedExercises = [],
            DraftExercises = [draftExercise],
            PlannedAt = new DateOnly(2026, 5, 1),
            CreatedAt = DateTimeOffset.UtcNow
        };

        PlannedWorkout? updatedWorkout = null;
        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository.Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>())).ReturnsAsync(workout);
        plannedWorkoutRepository
            .Setup(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()))
            .Callback<PlannedWorkout, CancellationToken>((w, _) => updatedWorkout = w);

        var sut = CreateSut(plannedWorkoutRepository: plannedWorkoutRepository, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(new PublishDraftExercisesCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(updatedWorkout);

        // Draft moved to Published
        Assert.Single(updatedWorkout!.PublishedExercises);
        var published = updatedWorkout.PublishedExercises.First();
        Assert.Equal("Draft Squat", published.Name);
        Assert.True(published.IsPublished);

        // Draft cleared
        Assert.Null(updatedWorkout.DraftExercises);

        // Response reflects published
        Assert.Single(result.PublishedExercises);
        Assert.Null(result.DraftExercises);

        plannedWorkoutRepository.Verify(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    private static PublishDraftExercisesCommandHandler CreateSut(
        Mock<IPlannedWorkoutRepository>? plannedWorkoutRepository = null,
        Mock<IExerciseRepository>? exerciseRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null)
    {
        var exerciseRepo = exerciseRepository ?? new Mock<IExerciseRepository>();
        exerciseRepo
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        return new PublishDraftExercisesCommandHandler(
            (plannedWorkoutRepository ?? new Mock<IPlannedWorkoutRepository>()).Object,
            exerciseRepo.Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object,
            new Mock<ICoachInsightsRebuildPublisher>().Object);
    }

    private static PublishDraftExercisesCommand CreateCommand()
    {
        return new PublishDraftExercisesCommand
        {
            TraineeId = Guid.NewGuid(),
            PlannedWorkoutId = Guid.NewGuid()
        };
    }
}
