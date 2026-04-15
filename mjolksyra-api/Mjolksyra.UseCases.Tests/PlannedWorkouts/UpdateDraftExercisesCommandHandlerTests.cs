using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkout;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class UpdatePlannedWorkoutWithExercisesCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserNotAuthenticated_AndDraftExercisesProvided_ReturnsNull()
    {
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);

        var workout = new PlannedWorkout
        {
            Id = workoutId,
            TraineeId = traineeId,
            PublishedExercises = [],
            PlannedAt = new DateOnly(2026, 5, 1),
            CreatedAt = DateTimeOffset.UtcNow
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository.Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>())).ReturnsAsync(workout);

        var sut = CreateSut(plannedWorkoutRepository: plannedWorkoutRepository, userContext: userContext);

        var result = await sut.Handle(new UpdatePlannedWorkoutCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId,
            Workout = new PlannedWorkoutRequest
            {
                PlannedAt = new DateOnly(2026, 5, 1),
                DraftExercises = []
            }
        }, CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenNotCoach_ReturnsNull()
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
                CoachUserId = Guid.NewGuid(), // different coach
                Status = TraineeStatus.Active
            });

        var workout = new PlannedWorkout
        {
            Id = workoutId,
            TraineeId = traineeId,
            PublishedExercises = [],
            PlannedAt = new DateOnly(2026, 5, 1),
            CreatedAt = DateTimeOffset.UtcNow
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository.Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>())).ReturnsAsync(workout);

        var sut = CreateSut(plannedWorkoutRepository: plannedWorkoutRepository, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(new UpdatePlannedWorkoutCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId,
            Workout = new PlannedWorkoutRequest
            {
                PlannedAt = new DateOnly(2026, 5, 1),
                DraftExercises = []
            }
        }, CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenAuthorized_SetsDraftExercisesWithoutTouchingPublished()
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
                Status = TraineeStatus.Active
            });

        var publishedExercise = new PlannedExercise
        {
            Id = Guid.NewGuid(),
            Name = "Published Exercise",
            IsPublished = true,
            AddedBy = ExerciseAddedBy.Coach
        };

        var workout = new PlannedWorkout
        {
            Id = workoutId,
            TraineeId = traineeId,
            PublishedExercises = [publishedExercise],
            DraftExercises = null,
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

        var result = await sut.Handle(new UpdatePlannedWorkoutCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId,
            Workout = new PlannedWorkoutRequest
            {
                PlannedAt = new DateOnly(2026, 5, 1),
                DraftExercises =
                [
                    new PlannedExerciseRequest
                    {
                        Name = "Draft Squat",
                        Prescription = new PlannedExercisePrescriptionRequest
                        {
                            Type = ExerciseType.SetsReps,
                            Sets =
                            [
                                new ExercisePrescriptionSetRequest
                                {
                                    Target = new ExercisePrescriptionSetTargetRequest { Reps = 5, WeightKg = 100 }
                                }
                            ]
                        }
                    }
                ]
            }
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(updatedWorkout);

        // PublishedExercises unchanged
        Assert.Single(updatedWorkout!.PublishedExercises);
        Assert.Equal("Published Exercise", updatedWorkout.PublishedExercises.First().Name);

        // DraftExercises set with new exercise
        Assert.NotNull(updatedWorkout.DraftExercises);
        Assert.Single(updatedWorkout.DraftExercises);
        var draft = updatedWorkout.DraftExercises!.First();
        Assert.Equal("Draft Squat", draft.Name);
        Assert.Equal(ExerciseAddedBy.Coach, draft.AddedBy);
        Assert.False(draft.IsPublished);

        plannedWorkoutRepository.Verify(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenWorkoutNotFound_ReturnsNull()
    {
        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository.Setup(x => x.Get(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((PlannedWorkout?)null);

        var sut = CreateSut(plannedWorkoutRepository: plannedWorkoutRepository);

        var result = await sut.Handle(new UpdatePlannedWorkoutCommand
        {
            TraineeId = Guid.NewGuid(),
            PlannedWorkoutId = Guid.NewGuid(),
            Workout = new PlannedWorkoutRequest
            {
                PlannedAt = new DateOnly(2026, 5, 1),
                DraftExercises = []
            }
        }, CancellationToken.None);

        Assert.Null(result);
        plannedWorkoutRepository.Verify(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenNoDraftExercises_SkipsAuthAndUpdatesMetadata()
    {
        var workoutId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var workout = new PlannedWorkout
        {
            Id = workoutId,
            TraineeId = traineeId,
            PublishedExercises = [],
            PlannedAt = new DateOnly(2026, 5, 1),
            CreatedAt = DateTimeOffset.UtcNow
        };

        PlannedWorkout? updatedWorkout = null;
        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository.Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>())).ReturnsAsync(workout);
        plannedWorkoutRepository
            .Setup(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()))
            .Callback<PlannedWorkout, CancellationToken>((w, _) => updatedWorkout = w);

        var sut = CreateSut(plannedWorkoutRepository: plannedWorkoutRepository);

        var result = await sut.Handle(new UpdatePlannedWorkoutCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId,
            Workout = new PlannedWorkoutRequest
            {
                Name = "Updated Name",
                Note = "Updated Note",
                PlannedAt = new DateOnly(2026, 6, 1),
                DraftExercises = null
            }
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(updatedWorkout);
        Assert.Equal("Updated Name", updatedWorkout!.Name);
        Assert.Equal("Updated Note", updatedWorkout.Note);
        Assert.Equal(new DateOnly(2026, 6, 1), updatedWorkout.PlannedAt);
    }

    private static UpdatePlannedWorkoutCommandHandler CreateSut(
        Mock<IPlannedWorkoutRepository>? plannedWorkoutRepository = null,
        Mock<IExerciseRepository>? exerciseRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null)
    {
        var exerciseRepo = exerciseRepository ?? new Mock<IExerciseRepository>();
        exerciseRepo
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        return new UpdatePlannedWorkoutCommandHandler(
            (plannedWorkoutRepository ?? new Mock<IPlannedWorkoutRepository>()).Object,
            exerciseRepo.Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object);
    }
}
