using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.UpdateDraftExercises;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class UpdateDraftExercisesCommandHandlerTests
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
                CoachUserId = Guid.NewGuid(), // different coach
                Status = Domain.Database.Enum.TraineeStatus.Active
            });

        var sut = CreateSut(traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(new UpdateDraftExercisesCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = Guid.NewGuid(),
            Exercises = []
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
                Status = Domain.Database.Enum.TraineeStatus.Active
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

        var result = await sut.Handle(new UpdateDraftExercisesCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = workoutId,
            Exercises =
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
                CoachUserId = userId,
                Status = Domain.Database.Enum.TraineeStatus.Active
            });

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository.Setup(x => x.Get(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync((PlannedWorkout?)null);

        var sut = CreateSut(plannedWorkoutRepository: plannedWorkoutRepository, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(new UpdateDraftExercisesCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = Guid.NewGuid(),
            Exercises = []
        }, CancellationToken.None);

        Assert.Null(result);
        plannedWorkoutRepository.Verify(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    private static UpdateDraftExercisesCommandHandler CreateSut(
        Mock<IPlannedWorkoutRepository>? plannedWorkoutRepository = null,
        Mock<IExerciseRepository>? exerciseRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null)
    {
        var exerciseRepo = exerciseRepository ?? new Mock<IExerciseRepository>();
        exerciseRepo
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        return new UpdateDraftExercisesCommandHandler(
            (plannedWorkoutRepository ?? new Mock<IPlannedWorkoutRepository>()).Object,
            exerciseRepo.Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object);
    }

    private static UpdateDraftExercisesCommand CreateCommand()
    {
        return new UpdateDraftExercisesCommand
        {
            TraineeId = Guid.NewGuid(),
            PlannedWorkoutId = Guid.NewGuid(),
            Exercises = []
        };
    }
}
