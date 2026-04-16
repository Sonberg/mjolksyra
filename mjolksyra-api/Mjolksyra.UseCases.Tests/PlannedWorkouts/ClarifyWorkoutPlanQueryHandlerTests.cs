using Moq;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.ClarifyWorkoutPlan;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class ClarifyWorkoutPlanQueryHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserNotAuthenticated_ReturnsNull()
    {
        var userContext = new Mock<IUserContext>();
        userContext
            .Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync((Guid?)null);

        var sut = CreateSut(userContext: userContext);

        var result = await sut.Handle(CreateQuery(), CancellationToken.None);

        Assert.Null(result);
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
            .Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee?)null);

        var sut = CreateSut(traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.Null(result);
    }

    [Fact]
    public async Task Handle_WhenAgentReturnsFollowUpQuestion_ReturnsClarification()
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

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.ClarifyAsync(It.IsAny<AIPlannerClarifyInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AIPlannerClarifyOutput
            {
                Message = "What start date are you targeting?",
                IsReadyToGenerate = false,
            });

        var sut = CreateSut(plannerAgent: plannerAgent, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("What start date are you targeting?", result.Message);
        Assert.False(result.IsReadyToGenerate);
        Assert.Null(result.SuggestedParams);
    }

    [Fact]
    public async Task Handle_WhenAgentIsReadyToGenerate_ReturnsSuggestedParams()
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

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.ClarifyAsync(It.IsAny<AIPlannerClarifyInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AIPlannerClarifyOutput
            {
                Message = "Ready to generate your 8-week program.",
                IsReadyToGenerate = true,
                SuggestedParams = new AIPlannerSuggestedParams
                {
                    StartDate = "2026-04-14",
                    NumberOfWeeks = 8,
                    ConflictStrategy = "Skip",
                },
            });

        var sut = CreateSut(plannerAgent: plannerAgent, traineeRepository: traineeRepository, userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result.IsReadyToGenerate);
        Assert.NotNull(result.SuggestedParams);
        Assert.Equal("2026-04-14", result.SuggestedParams.StartDate);
        Assert.Equal(8, result.SuggestedParams.NumberOfWeeks);
        Assert.Equal("Skip", result.SuggestedParams.ConflictStrategy);
    }

    [Fact]
    public async Task Handle_WhenAgentReturnsProposal_PersistsPendingProposalWithoutMutatingWorkouts()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var targetWorkoutId = Guid.NewGuid();

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

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.ClarifyAsync(It.IsAny<AIPlannerClarifyInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AIPlannerClarifyOutput
            {
                Message = "I staged the requested changes as a proposal.",
                IsReadyToApply = true,
                RequiresApproval = true,
                ProposedActionSet = new AIPlannerActionSet
                {
                    Summary = "Move Friday to Saturday.",
                    Explanation = "Keeps the week structure aligned with recovery.",
                    Actions =
                    [
                        new AIPlannerActionProposal
                        {
                            ActionType = AIPlannerProposalActionTypes.MoveWorkout,
                            Summary = "Move Fri Apr 10 workout to Sat Apr 11.",
                            TargetWorkoutId = targetWorkoutId,
                            PreviousDate = "2026-04-10",
                            TargetDate = "2026-04-11",
                            Workout = new PlannedWorkoutRequestPayload
                            {
                                PlannedAt = "2026-04-11",
                                Name = "Heavy lower",
                                Exercises = [],
                            },
                        },
                    ],
                },
                PreviewWorkouts =
                [
                    new AIPlannerWorkoutOutput
                    {
                        PlannedAt = "2026-04-11",
                        Name = "Heavy lower",
                        Exercises = [],
                    },
                ],
            });

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<Domain.Database.Common.PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data =
                [
                    new PlannedWorkout
                    {
                        Id = targetWorkoutId,
                        TraineeId = traineeId,
                        Name = "Heavy lower",
                        PlannedAt = new DateOnly(2026, 4, 10),
                        PublishedExercises = [],
                        CreatedAt = DateTimeOffset.UtcNow,
                    },
                ],
            });
        plannedWorkoutRepository
            .Setup(x => x.Get(targetWorkoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkout
            {
                Id = targetWorkoutId,
                TraineeId = traineeId,
                Name = "Heavy lower",
                PlannedAt = new DateOnly(2026, 4, 10),
                PublishedExercises = [],
                CreatedAt = DateTimeOffset.UtcNow,
            });

        var sessionRepository = new Mock<IPlannerSessionRepository>();
        sessionRepository
            .Setup(x => x.Create(It.IsAny<PlannerSession>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannerSession session, CancellationToken _) => session);

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            plannedWorkoutRepository: plannedWorkoutRepository,
            sessionRepository: sessionRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.True(result.IsReadyToApply);
        Assert.True(result.RequiresApproval);
        Assert.NotNull(result.ProposedActionSet);
        Assert.Single(result.ProposedActionSet.Actions);
        Assert.Equal(1, result.ProposedActionSet.CreditCost);
        Assert.Single(result.ProposedActionSet.CreditBreakdown);
        Assert.Equal(AIPlannerProposalStatus.Pending, result.ProposedActionSet.Status);
        Assert.Equal("2026-04-10", result.ProposedActionSet.AffectedDateFrom);
        Assert.Equal("2026-04-11", result.ProposedActionSet.AffectedDateTo);
        Assert.False(string.IsNullOrWhiteSpace(result.ProposedActionSet.SourceSnapshotHash));
        Assert.Single(result.PreviewWorkouts);
        plannedWorkoutRepository.Verify(x => x.Delete(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
        sessionRepository.Verify(x => x.Create(
            It.Is<PlannerSession>(session =>
                session.ProposedActionSet != null &&
                session.ProposedActionSet.Status == AIPlannerProposalStatus.Pending &&
                session.PreviewWorkouts.Count == 1),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenDeleteProposalOnlyContainsWorkoutIds_ResolvesDateRangeFromTargetWorkouts()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var firstWorkoutId = Guid.NewGuid();
        var lastWorkoutId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;
        var futureStart = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(1);
        var futureEnd = futureStart.AddDays(96);

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

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.ClarifyAsync(It.IsAny<AIPlannerClarifyInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AIPlannerClarifyOutput
            {
                Message = "I staged the deletion proposal.",
                IsReadyToApply = true,
                RequiresApproval = true,
                ProposedActionSet = new AIPlannerActionSet
                {
                    Summary = "Delete all future workouts.",
                    Explanation = "This removes all planned workouts after today.",
                    Actions =
                    [
                        new AIPlannerActionProposal
                        {
                            ActionType = AIPlannerProposalActionTypes.DeleteWorkout,
                            Summary = $"Delete workout on {futureStart:yyyy-MM-dd}",
                            TargetWorkoutId = firstWorkoutId,
                        },
                        new AIPlannerActionProposal
                        {
                            ActionType = AIPlannerProposalActionTypes.DeleteWorkout,
                            Summary = $"Delete workout on {futureEnd:yyyy-MM-dd}",
                            TargetWorkoutId = lastWorkoutId,
                        },
                    ],
                },
            });

        var firstWorkout = new PlannedWorkout
        {
            Id = firstWorkoutId,
            TraineeId = traineeId,
            PlannedAt = futureStart,
            PublishedExercises = [],
            CreatedAt = now,
        };
        var lastWorkout = new PlannedWorkout
        {
            Id = lastWorkoutId,
            TraineeId = traineeId,
            PlannedAt = futureEnd,
            PublishedExercises = [],
            CreatedAt = now,
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(firstWorkoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(firstWorkout);
        plannedWorkoutRepository
            .Setup(x => x.Get(lastWorkoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(lastWorkout);
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data = [firstWorkout, lastWorkout],
            });

        var sessionRepository = new Mock<IPlannerSessionRepository>();
        sessionRepository
            .Setup(x => x.Create(It.IsAny<PlannerSession>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannerSession session, CancellationToken _) => session);

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            plannedWorkoutRepository: plannedWorkoutRepository,
            sessionRepository: sessionRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(result.ProposedActionSet);
        Assert.Equal(futureStart.ToString("yyyy-MM-dd"), result.ProposedActionSet.AffectedDateFrom);
        Assert.Equal(futureEnd.ToString("yyyy-MM-dd"), result.ProposedActionSet.AffectedDateTo);
        Assert.Equal(1, result.ProposedActionSet.CreditCost);
        Assert.All(result.ProposedActionSet.Actions, action =>
        {
            Assert.False(string.IsNullOrWhiteSpace(action.TargetDate));
            Assert.False(string.IsNullOrWhiteSpace(action.BeforeStateFingerprint));
        });
    }

    [Fact]
    public async Task Handle_WhenDeleteProposalTargetsCompletedWorkout_IgnoresThatDeleteAction()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var completedWorkoutId = Guid.NewGuid();
        var openWorkoutId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;
        var pastWorkoutDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(-2);
        var futureWorkoutDate = DateOnly.FromDateTime(DateTime.UtcNow).AddDays(2);

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

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.ClarifyAsync(It.IsAny<AIPlannerClarifyInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AIPlannerClarifyOutput
            {
                Message = "I staged the deletion proposal.",
                IsReadyToApply = true,
                RequiresApproval = true,
                ProposedActionSet = new AIPlannerActionSet
                {
                    Summary = "Delete future workouts.",
                    Actions =
                    [
                        new AIPlannerActionProposal
                        {
                            ActionType = AIPlannerProposalActionTypes.DeleteWorkout,
                            Summary = "Delete completed workout.",
                            TargetWorkoutId = completedWorkoutId,
                        },
                        new AIPlannerActionProposal
                        {
                            ActionType = AIPlannerProposalActionTypes.DeleteWorkout,
                            Summary = "Delete open workout.",
                            TargetWorkoutId = openWorkoutId,
                        },
                    ],
                },
            });

        var completedWorkout = new PlannedWorkout
        {
            Id = completedWorkoutId,
            TraineeId = traineeId,
            PlannedAt = pastWorkoutDate,
            CreatedAt = now,
            PublishedExercises = [],
        };
        var openWorkout = new PlannedWorkout
        {
            Id = openWorkoutId,
            TraineeId = traineeId,
            PlannedAt = futureWorkoutDate,
            CreatedAt = now,
            PublishedExercises = [],
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(completedWorkoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(completedWorkout);
        plannedWorkoutRepository
            .Setup(x => x.Get(openWorkoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(openWorkout);
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data = [openWorkout],
            });

        var sessionRepository = new Mock<IPlannerSessionRepository>();
        sessionRepository
            .Setup(x => x.Create(It.IsAny<PlannerSession>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannerSession session, CancellationToken _) => session);

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            plannedWorkoutRepository: plannedWorkoutRepository,
            sessionRepository: sessionRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(result.ProposedActionSet);
        Assert.Single(result.ProposedActionSet.Actions);
        Assert.Equal(openWorkoutId, result.ProposedActionSet.Actions.Single().TargetWorkoutId);
        Assert.Equal(futureWorkoutDate.ToString("yyyy-MM-dd"), result.ProposedActionSet.AffectedDateFrom);
        Assert.Equal(futureWorkoutDate.ToString("yyyy-MM-dd"), result.ProposedActionSet.AffectedDateTo);
        Assert.Equal(1, result.ProposedActionSet.CreditCost);
    }

    [Fact]
    public async Task Handle_WhenProposalIsLarge_CapsPriceAtFiveCredits()
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

        var plannerAgent = new Mock<IAIWorkoutPlannerAgent>();
        plannerAgent
            .Setup(x => x.ClarifyAsync(It.IsAny<AIPlannerClarifyInput>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new AIPlannerClarifyOutput
            {
                Message = "I staged a large proposal.",
                IsReadyToApply = true,
                RequiresApproval = true,
                ProposedActionSet = new AIPlannerActionSet
                {
                    Summary = "Rebuild the next block.",
                    Actions = Enumerable.Range(0, 12).Select(index => new AIPlannerActionProposal
                    {
                        ActionType = AIPlannerProposalActionTypes.CreateWorkout,
                        Summary = $"Create workout {index + 1}.",
                        Workout = new PlannedWorkoutRequestPayload
                        {
                            PlannedAt = $"2026-05-{(index + 1):00}",
                            Name = $"Workout {index + 1}",
                            Exercises = [],
                        },
                    }).ToList(),
                },
            });

        var sessionRepository = new Mock<IPlannerSessionRepository>();
        sessionRepository
            .Setup(x => x.Create(It.IsAny<PlannerSession>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannerSession session, CancellationToken _) => session);

        var sut = CreateSut(
            plannerAgent: plannerAgent,
            sessionRepository: sessionRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(CreateQuery(traineeId: traineeId), CancellationToken.None);

        Assert.NotNull(result);
        Assert.NotNull(result.ProposedActionSet);
        Assert.Equal(5, result.ProposedActionSet.CreditCost);
    }

    [Fact]
    public async Task Handle_WhenSessionBelongsToAnotherCoach_ReturnsNull()
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
                Description = "Another coach session",
            });

        var sut = CreateSut(
            sessionRepository: sessionRepository,
            traineeRepository: traineeRepository,
            userContext: userContext);

        var result = await sut.Handle(new ClarifyWorkoutPlanQuery
        {
            TraineeId = traineeId,
            SessionId = sessionId,
            Description = "12-week strength program for a powerlifter",
        }, CancellationToken.None);

        Assert.Null(result);
    }

    private static ClarifyWorkoutPlanQueryHandler CreateSut(
        Mock<IAIWorkoutPlannerAgent>? plannerAgent = null,
        Mock<IPlannedWorkoutRepository>? plannedWorkoutRepository = null,
        Mock<IWorkoutMediaAnalysisRepository>? workoutMediaAnalysisRepository = null,
        Mock<IExerciseRepository>? exerciseRepository = null,
        Mock<IPlannerSessionRepository>? sessionRepository = null,
        Mock<ITraineeRepository>? traineeRepository = null,
        Mock<IUserContext>? userContext = null)
    {
        var workoutRepo = plannedWorkoutRepository ?? new Mock<IPlannedWorkoutRepository>();
        if (plannedWorkoutRepository is null)
        {
            workoutRepo
                .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [] });
            workoutRepo
                .Setup(x => x.Get(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
                .ThrowsAsync(new InvalidOperationException("Workout not found"));
        }

        var sessionRepo = sessionRepository ?? new Mock<IPlannerSessionRepository>();
        if (sessionRepository is null)
        {
            sessionRepo
                .Setup(x => x.Create(It.IsAny<PlannerSession>(), It.IsAny<CancellationToken>()))
                .ReturnsAsync((PlannerSession s, CancellationToken _) => s);
        }

        return new ClarifyWorkoutPlanQueryHandler(
            (plannerAgent ?? new Mock<IAIWorkoutPlannerAgent>()).Object,
            workoutRepo.Object,
            new Mock<ICompletedWorkoutRepository>().Object,
            (workoutMediaAnalysisRepository ?? new Mock<IWorkoutMediaAnalysisRepository>()).Object,
            (exerciseRepository ?? new Mock<IExerciseRepository>()).Object,
            new Mock<Mjolksyra.Domain.Messaging.IPlannedWorkoutDeletedPublisher>().Object,
            sessionRepo.Object,
            (traineeRepository ?? new Mock<ITraineeRepository>()).Object,
            new Mock<ITraineeInsightsRepository>().Object,
            new Mock<ICoachInsightsRepository>().Object,
            (userContext ?? new Mock<IUserContext>()).Object);
    }

    private static ClarifyWorkoutPlanQuery CreateQuery(Guid? traineeId = null)
    {
        return new ClarifyWorkoutPlanQuery
        {
            TraineeId = traineeId ?? Guid.NewGuid(),
            Description = "12-week strength program for a powerlifter",
        };
    }
}
