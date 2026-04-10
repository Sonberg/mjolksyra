using MediatR;
using Moq;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Coaches.ConsumeCredits;
using Mjolksyra.UseCases.PlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;
using OneOf;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class AnalyzeWorkoutMediaCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserNotAuthenticated_ReturnsNull()
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
    public async Task Handle_WhenNoAccess_ReturnsNull()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var sut = CreateSut(traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateCommand(traineeId: traineeId), CancellationToken.None);

        Assert.True(result.IsT1);
    }

    [Fact]
    public async Task Handle_WhenWorkoutNotFound_ReturnsNull()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = Domain.Database.Enum.TraineeStatus.Active,
            });

        var workoutRepository = new Mock<IPlannedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.Get(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannedWorkout?)null);

        var sut = CreateSut(workoutRepository: workoutRepository, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateCommand(traineeId: traineeId), CancellationToken.None);

        Assert.True(result.IsT1);
    }

    [Fact]
    public async Task Handle_WhenAuthorized_ReturnsAnalysisResponse()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = Domain.Database.Enum.TraineeStatus.Active,
            });

        var workoutRepository = new Mock<IPlannedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 1),
                CreatedAt = DateTimeOffset.UtcNow,
                PublishedExercises = [],
            });

        var completedWorkoutRepository = new Mock<ICompletedWorkoutRepository>();
        completedWorkoutRepository
            .Setup(x => x.GetByPlannedWorkoutId(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new CompletedWorkout
            {
                Id = Guid.NewGuid(),
                PlannedWorkoutId = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 1),
                CreatedAt = DateTimeOffset.UtcNow,
                Exercises =
                [
                    new CompletedExercise
                    {
                        Id = Guid.NewGuid(),
                        Name = "Back Squat",
                        Prescription = new ExercisePrescription
                        {
                            Sets =
                            [
                                new ExercisePrescriptionSet
                                {
                                    Target = new ExercisePrescriptionSetTarget { Reps = 5, WeightKg = 120 },
                                    Actual = new ExercisePrescriptionSetActual { Reps = 5, WeightKg = 115, IsDone = true }
                                }
                            ]
                        }
                    }
                ]
            });

        var chatMessageRepository = new Mock<IPlannedWorkoutChatMessageRepository>();
        chatMessageRepository
            .Setup(x => x.GetByWorkoutId(traineeId, workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(
            [
                new PlannedWorkoutChatMessage
                {
                    Id = Guid.NewGuid(),
                    TraineeId = traineeId,
                    PlannedWorkoutId = workoutId,
                    UserId = Guid.NewGuid(),
                    Role = PlannedWorkoutChatRole.Athlete,
                    Message = "Felt strong today",
                    Media =
                    [
                        new PlannedWorkoutMedia { RawUrl = "https://media.example.com/workouts/athlete-chat.mov", Type = PlannedWorkoutMediaType.Video },
                    ],
                    CreatedAt = DateTimeOffset.UtcNow,
                    ModifiedAt = DateTimeOffset.UtcNow,
                },
                new PlannedWorkoutChatMessage
                {
                    Id = Guid.NewGuid(),
                    TraineeId = traineeId,
                    PlannedWorkoutId = workoutId,
                    UserId = Guid.NewGuid(),
                    Role = PlannedWorkoutChatRole.Coach,
                    Message = "Keep elbows under the bar",
                    CreatedAt = DateTimeOffset.UtcNow,
                    ModifiedAt = DateTimeOffset.UtcNow,
                },
            ]);

        var analysisAgent = new Mock<IWorkoutMediaAnalysisAgent>();
        analysisAgent
            .Setup(x => x.AnalyzeAsync(It.IsAny<WorkoutMediaAnalysisInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new WorkoutMediaAnalysis
            {
                Summary = "Good control and tempo.",
                KeyFindings = ["Consistent depth"],
                TechniqueRisks = ["Minor knee valgus on last rep"],
                CoachSuggestions = ["Cue knees out on ascent"],
            });

        var analysisRepository = new Mock<IWorkoutMediaAnalysisRepository>();
        analysisRepository
            .Setup(x => x.Create(It.IsAny<WorkoutMediaAnalysisRecord>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((WorkoutMediaAnalysisRecord x, CancellationToken _) => x);

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(x => x.Send(It.IsAny<ConsumeCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf<ConsumeCreditsSuccess, ConsumeCreditsError>.FromT0(new ConsumeCreditsSuccess(10, 5)));

        var sut = CreateSut(mediator, workoutRepository, completedWorkoutRepository, chatMessageRepository, traineeRepository, userContext, analysisRepository, analysisAgent);

        var result = await sut.Handle(CreateCommand(traineeId, workoutId), CancellationToken.None);

        Assert.True(result.IsT0);
        Assert.Equal("Good control and tempo.", result.AsT0.Summary);
        Assert.Single(result.AsT0.KeyFindings);
        analysisAgent.Verify(
            x => x.AnalyzeAsync(
                It.Is<WorkoutMediaAnalysisInput>(input =>
                    input.ToolDispatcher != null &&
                    input.Text.Contains("Please review form") &&
                    input.Text.Contains("Authoritative workout log rep counts:") &&
                    input.Text.Contains("Back Squat: totalLoggedReps=5; setsWithLoggedReps=1; perSet=[set 1=5]") &&
                    input.Text.Contains("Use these logged rep counts as source of truth.") &&
                    input.Text.Contains("[Athlete] Felt strong today") &&
                    input.Text.Contains("[Coach] Keep elbows under the bar") &&
                    input.VideoUrls.Count == 1 &&
                    input.VideoUrls.Contains("https://media.example.com/workouts/athlete-chat.mov") &&
                    input.Exercises.Count == 1 &&
                    input.Exercises.First().Name == "Back Squat"),
                It.IsAny<CancellationToken>()),
            Times.Once);
        analysisRepository.Verify(
            x => x.Create(
                It.Is<WorkoutMediaAnalysisRecord>(record =>
                    record.TraineeId == traineeId &&
                    record.PlannedWorkoutId == workoutId &&
                    record.RequestedByUserId == userId &&
                    record.MediaUrls.Count == 1),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenUserIsAthlete_ReturnsNull()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = Guid.NewGuid(),
                AthleteUserId = userId,
                Status = Domain.Database.Enum.TraineeStatus.Active,
            });

        var workoutRepository = new Mock<IPlannedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 1),
                CreatedAt = DateTimeOffset.UtcNow,
                PublishedExercises = []
            });

        var analysisAgent = new Mock<IWorkoutMediaAnalysisAgent>();
        var sut = CreateSut(workoutRepository: workoutRepository, traineeRepository: traineeRepository, userContext: userContext, analysisAgent: analysisAgent);

        var result = await sut.Handle(CreateCommand(traineeId, workoutId), CancellationToken.None);

        Assert.True(result.IsT1);
        analysisAgent.Verify(
            x => x.AnalyzeAsync(It.IsAny<WorkoutMediaAnalysisInput>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_WhenNoChatHistory_UsesOriginalText()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = Domain.Database.Enum.TraineeStatus.Active,
            });

        var workoutRepository = new Mock<IPlannedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 1),
                CreatedAt = DateTimeOffset.UtcNow,
                PublishedExercises = []
            });

        var chatMessageRepository = new Mock<IPlannedWorkoutChatMessageRepository>();
        chatMessageRepository
            .Setup(x => x.GetByWorkoutId(traineeId, workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        var analysisAgent = new Mock<IWorkoutMediaAnalysisAgent>();
        analysisAgent
            .Setup(x => x.AnalyzeAsync(It.IsAny<WorkoutMediaAnalysisInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new WorkoutMediaAnalysis
            {
                Summary = "ok",
            });

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(x => x.Send(It.IsAny<ConsumeCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf<ConsumeCreditsSuccess, ConsumeCreditsError>.FromT0(new ConsumeCreditsSuccess(3, 0)));

        var sut = CreateSut(mediator, workoutRepository, chatMessageRepository: chatMessageRepository, traineeRepository: traineeRepository, userContext: userContext, analysisAgent: analysisAgent);

        var result = await sut.Handle(CreateCommand(traineeId, workoutId), CancellationToken.None);

        Assert.True(result.IsT0);
        analysisAgent.Verify(
            x => x.AnalyzeAsync(
                It.Is<WorkoutMediaAnalysisInput>(input => input.Text == "Please review form"),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenCreditsInsufficient_ReturnsInsufficientCreditsAndDoesNotAnalyze()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var workoutId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(userId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository
            .Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        traineeRepository
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Trainee
            {
                Id = traineeId,
                CoachUserId = userId,
                AthleteUserId = Guid.NewGuid(),
                Status = Domain.Database.Enum.TraineeStatus.Active,
            });

        var workoutRepository = new Mock<IPlannedWorkoutRepository>();
        workoutRepository
            .Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 4, 1),
                CreatedAt = DateTimeOffset.UtcNow,
                PublishedExercises = []
            });

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(x => x.Send(It.IsAny<ConsumeCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf<ConsumeCreditsSuccess, ConsumeCreditsError>.FromT1(new ConsumeCreditsError("Insufficient credits.")));

        var analysisAgent = new Mock<IWorkoutMediaAnalysisAgent>();
        var sut = CreateSut(mediator: mediator, workoutRepository: workoutRepository, traineeRepository: traineeRepository, userContext: userContext, analysisAgent: analysisAgent);

        var result = await sut.Handle(CreateCommand(traineeId, workoutId), CancellationToken.None);

        Assert.True(result.IsT2);
        Assert.Equal("Insufficient credits.", result.AsT2.Reason);
        analysisAgent.Verify(x => x.AnalyzeAsync(It.IsAny<WorkoutMediaAnalysisInput>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    private static AnalyzeWorkoutMediaCommandHandler CreateSut(
        Mock<IMediator>? mediator = null,
        Mock<IPlannedWorkoutRepository>? workoutRepository = null,
        Mock<ICompletedWorkoutRepository>? completedWorkoutRepository = null,
        Mock<IPlannedWorkoutChatMessageRepository>? chatMessageRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null,
        Mock<IWorkoutMediaAnalysisRepository>? analysisRepository = null,
        Mock<IWorkoutMediaAnalysisAgent>? analysisAgent = null)
    {
        return new AnalyzeWorkoutMediaCommandHandler(
            (mediator ?? new Mock<IMediator>()).Object,
            (workoutRepository ?? new Mock<IPlannedWorkoutRepository>()).Object,
            (completedWorkoutRepository ?? new Mock<ICompletedWorkoutRepository>()).Object,
            (chatMessageRepository ?? new Mock<IPlannedWorkoutChatMessageRepository>()).Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            (userContext ?? new Mock<IUserContext>()).Object,
            (analysisRepository ?? new Mock<IWorkoutMediaAnalysisRepository>()).Object,
            (analysisAgent ?? new Mock<IWorkoutMediaAnalysisAgent>()).Object);
    }

    private static AnalyzeWorkoutMediaCommand CreateCommand(Guid? traineeId = null, Guid? workoutId = null)
    {
        return new AnalyzeWorkoutMediaCommand
        {
            TraineeId = traineeId ?? Guid.NewGuid(),
            PlannedWorkoutId = workoutId ?? Guid.NewGuid(),
            Analysis = new WorkoutMediaAnalysisRequest
            {
                Text = "Please review form",
            }
        };
    }
}
