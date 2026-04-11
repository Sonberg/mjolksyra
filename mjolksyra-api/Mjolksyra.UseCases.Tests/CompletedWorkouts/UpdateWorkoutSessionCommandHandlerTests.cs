using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.CompletedWorkouts.UpdateWorkoutSession;

namespace Mjolksyra.UseCases.Tests.CompletedWorkouts;

public class UpdateWorkoutSessionCommandHandlerTests
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
    public async Task Handle_WhenSessionNotFound_ReturnsNull()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var sessionId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.GetById(sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((CompletedWorkout?)null);

        var sut = CreateSut(completedWorkoutRepository: completedWorkoutRepository, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(new UpdateWorkoutSessionCommand
        {
            TraineeId = traineeId,
            Id = sessionId,
            Session = new UpdateWorkoutSessionRequest { Exercises = [] }
        }, CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_AthleteCanDeleteCoachAddedExercise()
    {
        var athleteUserId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();
        var sessionId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(athleteUserId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, athleteUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                AthleteUserId = athleteUserId,
                CoachUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active
            });

        var session = new CompletedWorkout
        {
            Id = sessionId,
            PlannedWorkoutId = workoutId,
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 5, 1),
            Exercises =
            [
                new CompletedExercise { Id = Guid.NewGuid(), Name = "Coach Exercise 1" },
                new CompletedExercise { Id = Guid.NewGuid(), Name = "Coach Exercise 2" }
            ],
            CreatedAt = DateTimeOffset.UtcNow
        };

        CompletedWorkout? updatedSession = null;
        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.GetById(sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);
        completedWorkoutRepository
            .Setup(x => x.Update(It.IsAny<CompletedWorkout>(), It.IsAny<CancellationToken>()))
            .Callback<CompletedWorkout, CancellationToken>((s, _) => updatedSession = s);

        var sut = CreateSut(completedWorkoutRepository: completedWorkoutRepository, traineeRepository: traineeRepository, userContext: userContext);

        // Athlete submits only one exercise (deletes the other)
        var result = await sut.Handle(new UpdateWorkoutSessionCommand
        {
            TraineeId = traineeId,
            Id = sessionId,
            Session = new UpdateWorkoutSessionRequest
            {
                Exercises =
                [
                    new CompletedExerciseRequest { Name = "Coach Exercise 1" }
                ]
            }
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(updatedSession);
        Assert.Single(updatedSession!.Exercises);
        Assert.Equal("Coach Exercise 1", updatedSession.Exercises.First().Name);
    }

    [Fact]
    public async Task Handle_AthleteCanAddNewExercise()
    {
        var athleteUserId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();
        var sessionId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(athleteUserId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, athleteUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                AthleteUserId = athleteUserId,
                CoachUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active
            });

        var session = new CompletedWorkout
        {
            Id = sessionId,
            PlannedWorkoutId = workoutId,
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 5, 1),
            Exercises = [new CompletedExercise { Id = Guid.NewGuid(), Name = "Original Exercise" }],
            CreatedAt = DateTimeOffset.UtcNow
        };

        CompletedWorkout? updatedSession = null;
        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.GetById(sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);
        completedWorkoutRepository
            .Setup(x => x.Update(It.IsAny<CompletedWorkout>(), It.IsAny<CancellationToken>()))
            .Callback<CompletedWorkout, CancellationToken>((s, _) => updatedSession = s);

        var sut = CreateSut(completedWorkoutRepository: completedWorkoutRepository, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(new UpdateWorkoutSessionCommand
        {
            TraineeId = traineeId,
            Id = sessionId,
            Session = new UpdateWorkoutSessionRequest
            {
                Exercises =
                [
                    new CompletedExerciseRequest { Name = "Original Exercise" },
                    new CompletedExerciseRequest { Name = "Athlete Added Exercise" }
                ]
            }
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(updatedSession);
        Assert.Equal(2, updatedSession!.Exercises.Count);
        Assert.Contains(updatedSession.Exercises, e => e.Name == "Athlete Added Exercise");
    }

    [Fact]
    public async Task Handle_WhenMarkingComplete_NotifiesCoachAndClearsReviewedAt()
    {
        var athleteUserId = Guid.NewGuid();
        var coachUserId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();
        var sessionId = Guid.NewGuid();
        var completedAt = DateTimeOffset.UtcNow;

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(athleteUserId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, athleteUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                AthleteUserId = athleteUserId,
                CoachUserId = coachUserId,
                Status = TraineeStatus.Active
            });

        var session = new CompletedWorkout
        {
            Id = sessionId,
            PlannedWorkoutId = workoutId,
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 5, 1),
            Exercises = [],
            CompletedAt = null,
            ReviewedAt = DateTimeOffset.UtcNow.AddDays(-1),
            CreatedAt = DateTimeOffset.UtcNow
        };

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.GetById(sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);

        var notificationService = new Mock<INotificationService>();

        var sut = CreateSut(
            completedWorkoutRepository: completedWorkoutRepository,
            traineeRepository: traineeRepository,
            userContext: userContext,
            notificationService: notificationService);

        var result = await sut.Handle(new UpdateWorkoutSessionCommand
        {
            TraineeId = traineeId,
            Id = sessionId,
            Session = new UpdateWorkoutSessionRequest
            {
                Exercises = [],
                CompletedAt = completedAt
            }
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(completedAt, result.CompletedAt);
        Assert.Null(result.ReviewedAt); // Cleared when completed

        notificationService.Verify(
            x => x.Notify(coachUserId, "workout.completed", It.IsAny<string>(), It.IsAny<string?>(), It.IsAny<string?>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_AthleteCanReorderExercises()
    {
        var athleteUserId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();
        var sessionId = Guid.NewGuid();
        var exerciseAId = Guid.NewGuid();
        var exerciseBId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(athleteUserId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, athleteUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                AthleteUserId = athleteUserId,
                CoachUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active
            });

        var session = new CompletedWorkout
        {
            Id = sessionId,
            PlannedWorkoutId = workoutId,
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 5, 1),
            Exercises =
            [
                new CompletedExercise { Id = exerciseAId, Name = "Exercise A" },
                new CompletedExercise { Id = exerciseBId, Name = "Exercise B" }
            ],
            CreatedAt = DateTimeOffset.UtcNow
        };

        CompletedWorkout? updatedSession = null;
        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.GetById(sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);
        completedWorkoutRepository
            .Setup(x => x.Update(It.IsAny<CompletedWorkout>(), It.IsAny<CancellationToken>()))
            .Callback<CompletedWorkout, CancellationToken>((s, _) => updatedSession = s);

        var sut = CreateSut(completedWorkoutRepository: completedWorkoutRepository, traineeRepository: traineeRepository, userContext: userContext);

        // Athlete reorders: B first, then A
        var result = await sut.Handle(new UpdateWorkoutSessionCommand
        {
            TraineeId = traineeId,
            Id = sessionId,
            Session = new UpdateWorkoutSessionRequest
            {
                Exercises =
                [
                    new CompletedExerciseRequest { Id = exerciseBId, Name = "Exercise B" },
                    new CompletedExerciseRequest { Id = exerciseAId, Name = "Exercise A" }
                ]
            }
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(updatedSession);
        Assert.Equal(2, updatedSession!.Exercises.Count);
        Assert.Equal("Exercise B", updatedSession.Exercises.First().Name);
        Assert.Equal("Exercise A", updatedSession.Exercises.Last().Name);
    }

    private static UpdateWorkoutSessionCommandHandler CreateSut(
        Mock<ICompletedWorkoutRepository>? completedWorkoutRepository = null,
        Mock<IExerciseRepository>? exerciseRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null,
        Mock<INotificationService>? notificationService = null)
    {
        var exerciseRepo = exerciseRepository ?? new Mock<IExerciseRepository>();
        exerciseRepo
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        return new UpdateWorkoutSessionCommandHandler(
            (completedWorkoutRepository ?? new Mock<ICompletedWorkoutRepository>()).Object,
            exerciseRepo.Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object,
            (notificationService ?? new Mock<INotificationService>()).Object);
    }

    private static UpdateWorkoutSessionCommand CreateCommand()
    {
        return new UpdateWorkoutSessionCommand
        {
            TraineeId = Guid.NewGuid(),
            Id = Guid.NewGuid(),
            Session = new UpdateWorkoutSessionRequest { Exercises = [] }
        };
    }
}
