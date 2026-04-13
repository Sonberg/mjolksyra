using MediatR;
using Moq;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Coaches.ReleaseCreditsReservation;
using Mjolksyra.UseCases.Coaches.ReserveCredits;
using Mjolksyra.UseCases.Coaches.SettleCreditsReservation;
using Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;
using OneOf;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class GenerateWorkoutPlanCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserNotAuthenticated_ReturnsForbidden()
    {
        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid?)null);

        var sut = CreateSut(userContext: userContext);

        var result = await sut.Handle(CreateCommand(), CancellationToken.None);

        Assert.True(result.IsT1);
    }

    [Fact]
    public async Task Handle_WhenNotCoach_ReturnsForbidden()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = Guid.NewGuid(),
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var sut = CreateSut(traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateCommand(traineeId: traineeId), CancellationToken.None);

        Assert.True(result.IsT1);
    }

    [Fact]
    public async Task Handle_WhenInsufficientCredits_ReturnsInsufficientCreditsResult()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(x => x.Send(It.IsAny<ReserveCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf<ReserveCreditsSuccess, ReserveCreditsError>.FromT1(new ReserveCreditsError("Insufficient credits.")));

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();

        var sut = CreateSut(mediator: mediator, plannerAgent: plannerAgent, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateCommand(traineeId: traineeId), CancellationToken.None);

        Assert.True(result.IsT2);
        plannerAgent.Verify(x => x.GenerateAsync(It.IsAny<AIPlannerGenerateInput>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenCreditsConsumed_UsesSessionIdAsReferenceId()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var sessionId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(x => x.Send(It.IsAny<ReserveCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf<ReserveCreditsSuccess, ReserveCreditsError>.FromT0(new ReserveCreditsSuccess(1, 0, 1)));
        mediator
            .Setup(x => x.Send(It.IsAny<ReleaseCreditsReservationCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ReleaseCreditsReservationResult(true));

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.GenerateAsync(It.IsAny<AIPlannerGenerateInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var sut = CreateSut(mediator: mediator, plannerAgent: plannerAgent, traineeRepository: traineeRepository, userContext: userContext);

        await sut.Handle(CreateCommand(traineeId: traineeId, sessionId: sessionId), CancellationToken.None);

        mediator.Verify(x => x.Send(
            It.Is<ReserveCreditsCommand>(c =>
                c.CoachUserId == userId &&
                c.Action == CreditAction.GenerateWorkoutPlan &&
                c.ReferenceId == sessionId.ToString()),
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenSessionBelongsToAnotherCoach_ReturnsForbidden()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var sessionId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var sessionRepository = new Mock<IPlannerSessionRepository>();
        sessionRepository
            .Setup(x => x.GetById(sessionId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannerSession
            {
                Id = sessionId,
                TraineeId = traineeId,
                CoachUserId = Guid.NewGuid(),
                Description = "Other coach session",
            });

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            sessionRepository: sessionRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(
            CreateCommand(traineeId: traineeId, sessionId: sessionId),
            CancellationToken.None);

        Assert.True(result.IsT1);
        plannerAgent.Verify(
            x => x.GenerateAsync(It.IsAny<AIPlannerGenerateInput>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_WithSkipStrategy_DoesNotOverwriteExistingWorkouts()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var existingDate = new DateOnly(2026, 4, 14);

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var existingWorkout = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            PlannedAt = existingDate,
            PublishedExercises = [],
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [existingWorkout] });

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.GenerateAsync(It.IsAny<AIPlannerGenerateInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new AIPlannerWorkoutOutput
                {
                    PlannedAt = existingDate.ToString("yyyy-MM-dd"),
                    Name = "Leg Day",
                    Exercises = [],
                },
            ]);

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            plannedWorkoutRepository: plannedWorkoutRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(CreateCommand(traineeId: traineeId, conflictStrategy: "Skip"), CancellationToken.None);

        Assert.True(result.IsT0);
        Assert.Equal(0, result.AsT0.WorkoutsCreated);
        plannedWorkoutRepository.Verify(
            x => x.Create(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_WithReplaceStrategy_DeletesExistingBeforeCreating()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var plannedDate = new DateOnly(2026, 4, 14);

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var existingId = Guid.NewGuid();
        var existingWorkout = new PlannedWorkout
        {
            Id = existingId,
            TraineeId = traineeId,
            PlannedAt = plannedDate,
            PublishedExercises = [],
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [existingWorkout] });
        plannedWorkoutRepository
            .Setup(x => x.Create(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannedWorkout w, CancellationToken _) => w);

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.GenerateAsync(It.IsAny<AIPlannerGenerateInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new AIPlannerWorkoutOutput
                {
                    PlannedAt = plannedDate.ToString("yyyy-MM-dd"),
                    Name = "New Leg Day",
                    Exercises = [],
                },
            ]);

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            plannedWorkoutRepository: plannedWorkoutRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(CreateCommand(traineeId: traineeId, conflictStrategy: "Replace"), CancellationToken.None);

        Assert.True(result.IsT0);
        Assert.Equal(1, result.AsT0.WorkoutsCreated);
        plannedWorkoutRepository.Verify(
            x => x.Delete(existingId, It.IsAny<CancellationToken>()),
            Times.Once);
        plannedWorkoutRepository.Verify(
            x => x.Create(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenAgentReturnsWorkouts_CreatesDrafts()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var exerciseId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [] });
        plannedWorkoutRepository
            .Setup(x => x.Create(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannedWorkout w, CancellationToken _) => w);

        var exerciseRepository = new Mock<IExerciseRepository>();
        exerciseRepository
            .Setup(x => x.Search("Bench Press", It.IsAny<ICollection<ExerciseSport>>(), It.IsAny<ICollection<ExerciseLevel>>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new Exercise
                {
                    Id = exerciseId,
                    Name = "Bench Press",
                    Type = Domain.Database.Models.ExerciseType.SetsReps,
                    CreatedAt = DateTimeOffset.UtcNow,
                },
            ]);

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.GenerateAsync(It.IsAny<AIPlannerGenerateInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new AIPlannerWorkoutOutput
                {
                    PlannedAt = "2026-04-14",
                    Name = "Upper Body",
                    Exercises =
                    [
                        new AIPlannerExerciseOutput
                        {
                            Name = "Bench Press",
                            PrescriptionType = "SetsReps",
                            Sets = [new AIPlannerSetOutput { Reps = 5, WeightKg = 80 }],
                        },
                    ],
                },
                new AIPlannerWorkoutOutput
                {
                    PlannedAt = "2026-04-16",
                    Name = "Lower Body",
                    Exercises = [],
                },
            ]);

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            plannedWorkoutRepository: plannedWorkoutRepository,
            exerciseRepository: exerciseRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(CreateCommand(traineeId: traineeId), CancellationToken.None);

        Assert.True(result.IsT0);
        Assert.Equal(2, result.AsT0.WorkoutsCreated);

        plannedWorkoutRepository.Verify(
            x => x.Create(
                It.Is<PlannedWorkout>(w => w.PublishedExercises.Count == 0),
                It.IsAny<CancellationToken>()),
            Times.Exactly(2));

        plannedWorkoutRepository.Verify(
            x => x.Update(
                It.Is<PlannedWorkout>(w =>
                    w.DraftExercises != null &&
                    w.DraftExercises.All(e =>
                        e.AddedBy == ExerciseAddedBy.Coach &&
                        (e.Name != "Bench Press" || e.ExerciseId == exerciseId))),
                It.IsAny<CancellationToken>()),
            Times.Exactly(2));
    }

    [Fact]
    public async Task Handle_WhenGeneratedExerciseMissing_CreatesCoachOwnedExercise()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        Exercise? createdExercise = null;

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = TraineeStatus.Active,
            });

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [] });
        plannedWorkoutRepository
            .Setup(x => x.Create(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannedWorkout w, CancellationToken _) => w);

        var exerciseRepository = new Mock<IExerciseRepository>();
        exerciseRepository
            .Setup(x => x.Search("Tempo Goblet Squat", It.IsAny<ICollection<ExerciseSport>>(), It.IsAny<ICollection<ExerciseLevel>>(), null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Exercise>());
        exerciseRepository
            .Setup(x => x.Create(It.IsAny<Exercise>(), It.IsAny<CancellationToken>()))
            .Callback<Exercise, CancellationToken>((exercise, _) => createdExercise = exercise)
            .ReturnsAsync((Exercise exercise, CancellationToken _) => exercise);

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.GenerateAsync(It.IsAny<AIPlannerGenerateInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new AIPlannerWorkoutOutput
                {
                    PlannedAt = "2026-04-14",
                    Name = "Lower Body",
                    Exercises =
                    [
                        new AIPlannerExerciseOutput
                        {
                            Name = "Tempo Goblet Squat",
                            PrescriptionType = "SetsReps",
                            Sets = [new AIPlannerSetOutput { Reps = 8, WeightKg = 24 }],
                        },
                    ],
                },
            ]);

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            plannedWorkoutRepository: plannedWorkoutRepository,
            exerciseRepository: exerciseRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(CreateCommand(traineeId: traineeId), CancellationToken.None);

        Assert.True(result.IsT0);
        Assert.NotNull(createdExercise);
        Assert.Equal("Tempo Goblet Squat", createdExercise!.Name);
        Assert.Equal(Domain.Database.Models.ExerciseType.SetsReps, createdExercise.Type);
        Assert.Equal(userId, createdExercise.CreatedBy);
        plannedWorkoutRepository.Verify(
            x => x.Create(
                It.Is<PlannedWorkout>(w => w.PublishedExercises.Count == 0),
                It.IsAny<CancellationToken>()),
            Times.Once);
        plannedWorkoutRepository.Verify(
            x => x.Update(
                It.Is<PlannedWorkout>(w =>
                    w.DraftExercises != null &&
                    w.DraftExercises.Any(e =>
                        e.Name == "Tempo Goblet Squat" &&
                        e.ExerciseId == createdExercise.Id &&
                        e.AddedBy == ExerciseAddedBy.Coach)),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    private static GenerateWorkoutPlanCommandHandler CreateSut(
        Mock<IMediator>? mediator = null,
        Mock<IAIWorkoutPlannerAgent>? plannerAgent = null,
        Mock<IPlannedWorkoutRepository>? plannedWorkoutRepository = null,
        Mock<IWorkoutMediaAnalysisRepository>? workoutMediaAnalysisRepository = null,
        Mock<IExerciseRepository>? exerciseRepository = null,
        Mock<IPlannedWorkoutDeletedPublisher>? deletedPublisher = null,
        Mock<IPlannerSessionRepository>? sessionRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null)
    {
        if (mediator is null)
        {
            mediator = new Mock<IMediator>();
            mediator
                .Setup(x => x.Send(It.IsAny<ReserveCreditsCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(OneOf<ReserveCreditsSuccess, ReserveCreditsError>.FromT0(new ReserveCreditsSuccess(1, 0, 1)));
            mediator
                .Setup(x => x.Send(It.IsAny<SettleCreditsReservationCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new SettleCreditsReservationResult(true));
            mediator
                .Setup(x => x.Send(It.IsAny<ReleaseCreditsReservationCommand>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new ReleaseCreditsReservationResult(true));
        }

        return new GenerateWorkoutPlanCommandHandler(
            mediator.Object,
            (plannerAgent ?? new Mock<IAIWorkoutPlannerAgent>()).Object,
            (plannedWorkoutRepository ?? new Mock<IPlannedWorkoutRepository>()).Object,
            new Mock<ICompletedWorkoutRepository>().Object,
            (workoutMediaAnalysisRepository ?? new Mock<IWorkoutMediaAnalysisRepository>()).Object,
            (exerciseRepository ?? new Mock<IExerciseRepository>()).Object,
            (deletedPublisher ?? new Mock<IPlannedWorkoutDeletedPublisher>()).Object,
            (sessionRepository ?? new Mock<IPlannerSessionRepository>()).Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object);
    }

    private static GenerateWorkoutPlanCommand CreateCommand(
        Guid? traineeId = null,
        Guid? sessionId = null,
        string conflictStrategy = "Skip")
    {
        return new GenerateWorkoutPlanCommand
        {
            TraineeId = traineeId ?? Guid.NewGuid(),
            SessionId = sessionId,
            Description = "12-week strength program",
            Params = new GenerateWorkoutPlanParams
            {
                StartDate = "2026-04-14",
                NumberOfWeeks = 12,
                ConflictStrategy = conflictStrategy,
            },
        };
    }
}
