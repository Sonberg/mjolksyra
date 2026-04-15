using MediatR;
using Moq;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Coaches.ConsumeCredits;
using Mjolksyra.UseCases.PlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.ApplyAIPlannerProposal;
using Mjolksyra.UseCases.PlannedWorkouts.CreatePlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.DeletePlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkout;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class ApplyAIPlannerProposalCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenProposalIsPending_AppliesActionsAndMarksSessionApplied()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var proposalId = Guid.NewGuid();
        var sessionId = Guid.NewGuid();
        var targetWorkoutId = Guid.NewGuid();
        var createdWorkoutId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;

        var existingWorkout = new PlannedWorkout
        {
            Id = targetWorkoutId,
            TraineeId = traineeId,
            Name = "Upper",
            PlannedAt = new DateOnly(2026, 4, 14),
            PublishedExercises = [],
            CreatedAt = now,
        };

        var proposal = new AIPlannerActionSet
        {
            Id = proposalId,
            Status = AIPlannerProposalStatus.Pending,
            Summary = "Create one workout and move another.",
            CreditCost = 1,
            AffectedDateFrom = "2026-04-14",
            AffectedDateTo = "2026-04-15",
            SourceSnapshotHash = AIPlannerProposalFingerprint.ComputeWorkoutsFingerprint([existingWorkout]),
            Actions =
            [
                new AIPlannerActionProposal
                {
                    ActionType = AIPlannerProposalActionTypes.CreateWorkout,
                    Summary = "Create Tue Apr 15 workout.",
                    TargetDate = "2026-04-15",
                    Workout = new PlannedWorkoutRequestPayload
                    {
                        PlannedAt = "2026-04-15",
                        Name = "Lower",
                        Exercises = [],
                    },
                },
                new AIPlannerActionProposal
                {
                    ActionType = AIPlannerProposalActionTypes.MoveWorkout,
                    Summary = "Move Upper from Apr 14 to Apr 15.",
                    TargetWorkoutId = targetWorkoutId,
                    PreviousDate = "2026-04-14",
                    TargetDate = "2026-04-15",
                    BeforeStateFingerprint = AIPlannerProposalFingerprint.ComputeWorkoutFingerprint(existingWorkout),
                    Workout = new PlannedWorkoutRequestPayload
                    {
                        PlannedAt = "2026-04-15",
                        Name = "Upper",
                        Exercises = [],
                    },
                },
            ],
        };

        var session = new PlannerSession
        {
            Id = sessionId,
            TraineeId = traineeId,
            CoachUserId = userId,
            Description = "Plan next week",
            ProposedActionSet = proposal,
            CreatedAt = now,
            UpdatedAt = now,
        };

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(x => x.Send(It.IsAny<ConsumeCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf.OneOf<ConsumeCreditsSuccess, ConsumeCreditsError>.FromT0(
                new ConsumeCreditsSuccess(10, 5)));
        mediator
            .Setup(x => x.Send(It.IsAny<CreatePlannedWorkoutCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkoutResponse
            {
                Id = createdWorkoutId,
                TraineeId = traineeId,
                Name = "Lower",
                Note = null,
                PublishedExercises = [],
                PlannedAt = new DateOnly(2026, 4, 15),
                CreatedAt = now,
            });
        mediator
            .Setup(x => x.Send(It.IsAny<UpdatePlannedWorkoutCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannedWorkoutResponse
            {
                Id = targetWorkoutId,
                TraineeId = traineeId,
                Name = "Upper",
                Note = null,
                PublishedExercises = [],
                PlannedAt = new DateOnly(2026, 4, 15),
                CreatedAt = now,
            });

        var sessionRepository = new Mock<IPlannerSessionRepository>();
        sessionRepository
            .Setup(x => x.GetByProposalId(proposalId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [existingWorkout] });

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

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var sut = new ApplyAIPlannerProposalCommandHandler(
            mediator.Object,
            sessionRepository.Object,
            plannedWorkoutRepository.Object,
            new Mock<IExerciseRepository>().Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new ApplyAIPlannerProposalCommand
        {
            TraineeId = traineeId,
            ProposalId = proposalId,
        }, CancellationToken.None);

        Assert.True(result.IsT0);
        Assert.Equal(2, result.AsT0.ActionsApplied);
        Assert.Equal(proposalId, result.AsT0.ProposalId);
        Assert.Equal(2, result.AsT0.WorkoutIds.Count);
        mediator.Verify(x => x.Send(
            It.Is<ConsumeCreditsCommand>(command =>
                command.Action == CreditAction.GenerateWorkoutPlan
                && command.ReferenceId == proposalId.ToString()
                && command.CreditCostOverride == 1),
            It.IsAny<CancellationToken>()), Times.Once);
        Assert.Equal(AIPlannerProposalStatus.Applied, session.ProposedActionSet?.Status);
        Assert.NotNull(session.ProposedActionSet?.AppliedAt);
        Assert.Equal(2, session.GenerationResult?.ActionsApplied);
        mediator.Verify(x => x.Send(It.IsAny<CreatePlannedWorkoutCommand>(), It.IsAny<CancellationToken>()), Times.Once);
        mediator.Verify(x => x.Send(It.IsAny<UpdatePlannedWorkoutCommand>(), It.IsAny<CancellationToken>()), Times.Exactly(2));
        sessionRepository.Verify(x => x.Update(session, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenWorkoutSnapshotChanged_ReturnsConflict()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var proposalId = Guid.NewGuid();
        var targetWorkoutId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;

        var originalWorkout = new PlannedWorkout
        {
            Id = targetWorkoutId,
            TraineeId = traineeId,
            Name = "Upper",
            PlannedAt = new DateOnly(2026, 4, 14),
            PublishedExercises = [],
            CreatedAt = now,
        };

        var changedWorkout = new PlannedWorkout
        {
            Id = targetWorkoutId,
            TraineeId = traineeId,
            Name = "Upper changed",
            PlannedAt = new DateOnly(2026, 4, 14),
            PublishedExercises = [],
            CreatedAt = now,
        };

        var sessionRepository = new Mock<IPlannerSessionRepository>();
        sessionRepository
            .Setup(x => x.GetByProposalId(proposalId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannerSession
            {
                Id = Guid.NewGuid(),
                TraineeId = traineeId,
                CoachUserId = userId,
                Description = "Plan next week",
                ProposedActionSet = new AIPlannerActionSet
                {
                    Id = proposalId,
                    Status = AIPlannerProposalStatus.Pending,
                    Summary = "Move workout",
                    AffectedDateFrom = "2026-04-14",
                    AffectedDateTo = "2026-04-14",
                    SourceSnapshotHash = AIPlannerProposalFingerprint.ComputeWorkoutsFingerprint([originalWorkout]),
                    Actions =
                    [
                        new AIPlannerActionProposal
                        {
                            ActionType = AIPlannerProposalActionTypes.MoveWorkout,
                            Summary = "Move workout",
                            TargetWorkoutId = targetWorkoutId,
                            BeforeStateFingerprint = AIPlannerProposalFingerprint.ComputeWorkoutFingerprint(originalWorkout),
                            Workout = new PlannedWorkoutRequestPayload
                            {
                                PlannedAt = "2026-04-15",
                                Name = "Upper",
                                Exercises = [],
                            },
                        },
                    ],
                },
                CreatedAt = now,
                UpdatedAt = now,
            });

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [changedWorkout] });

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

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var sut = new ApplyAIPlannerProposalCommandHandler(
            new Mock<IMediator>().Object,
            sessionRepository.Object,
            plannedWorkoutRepository.Object,
            new Mock<IExerciseRepository>().Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new ApplyAIPlannerProposalCommand
        {
            TraineeId = traineeId,
            ProposalId = proposalId,
        }, CancellationToken.None);

        Assert.True(result.IsT2);
        Assert.Contains("Planner state changed", result.AsT2.Reason);
        sessionRepository.Verify(x => x.Update(It.IsAny<PlannerSession>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenCreditsAreInsufficient_ReturnsInsufficientCreditsAndDoesNotMutateWorkouts()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var proposalId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;

        var sessionRepository = new Mock<IPlannerSessionRepository>();
        sessionRepository
            .Setup(x => x.GetByProposalId(proposalId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannerSession
            {
                Id = Guid.NewGuid(),
                TraineeId = traineeId,
                CoachUserId = userId,
                Description = "Plan next week",
                ProposedActionSet = new AIPlannerActionSet
                {
                    Id = proposalId,
                    Status = AIPlannerProposalStatus.Pending,
                    Summary = "Create workout",
                    CreditCost = 3,
                    AffectedDateFrom = "2026-04-14",
                    AffectedDateTo = "2026-04-14",
                    SourceSnapshotHash = AIPlannerProposalFingerprint.ComputeWorkoutsFingerprint([]),
                    Actions =
                    [
                        new AIPlannerActionProposal
                        {
                            ActionType = AIPlannerProposalActionTypes.CreateWorkout,
                            Summary = "Create workout",
                            Workout = new PlannedWorkoutRequestPayload
                            {
                                PlannedAt = "2026-04-14",
                                Name = "Upper",
                                Exercises = [],
                            },
                        },
                    ],
                },
                CreatedAt = now,
                UpdatedAt = now,
            });

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [] });

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

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(x => x.Send(It.IsAny<ConsumeCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf.OneOf<ConsumeCreditsSuccess, ConsumeCreditsError>.FromT1(
                new ConsumeCreditsError("Insufficient credits.")));

        var sut = new ApplyAIPlannerProposalCommandHandler(
            mediator.Object,
            sessionRepository.Object,
            plannedWorkoutRepository.Object,
            new Mock<IExerciseRepository>().Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new ApplyAIPlannerProposalCommand
        {
            TraineeId = traineeId,
            ProposalId = proposalId,
        }, CancellationToken.None);

        Assert.True(result.IsT3);
        Assert.Equal("Insufficient credits.", result.AsT3.Reason);
        mediator.Verify(x => x.Send(It.IsAny<CreatePlannedWorkoutCommand>(), It.IsAny<CancellationToken>()), Times.Never);
        sessionRepository.Verify(x => x.Update(It.IsAny<PlannerSession>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenDeleteOnlyProposalHasResolvedFutureRange_DeletesAllTargetedWorkouts()
    {
        var userId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var proposalId = Guid.NewGuid();
        var firstWorkoutId = Guid.NewGuid();
        var secondWorkoutId = Guid.NewGuid();
        var now = DateTimeOffset.UtcNow;
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var firstDate = today.AddDays(1);
        var secondDate = today.AddDays(10);

        var firstWorkout = new PlannedWorkout
        {
            Id = firstWorkoutId,
            TraineeId = traineeId,
            PlannedAt = firstDate,
            PublishedExercises = [],
            CreatedAt = now,
        };
        var secondWorkout = new PlannedWorkout
        {
            Id = secondWorkoutId,
            TraineeId = traineeId,
            PlannedAt = secondDate,
            PublishedExercises = [],
            CreatedAt = now,
        };

        var sessionRepository = new Mock<IPlannerSessionRepository>();
        sessionRepository
            .Setup(x => x.GetByProposalId(proposalId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new PlannerSession
            {
                Id = Guid.NewGuid(),
                TraineeId = traineeId,
                CoachUserId = userId,
                Description = "Delete future workouts",
                ProposedActionSet = new AIPlannerActionSet
                {
                    Id = proposalId,
                    Status = AIPlannerProposalStatus.Pending,
                    Summary = "Delete all future workouts.",
                    CreditCost = 1,
                    AffectedDateFrom = firstDate.ToString("yyyy-MM-dd"),
                    AffectedDateTo = secondDate.ToString("yyyy-MM-dd"),
                    SourceSnapshotHash = AIPlannerProposalFingerprint.ComputeWorkoutsFingerprint([firstWorkout, secondWorkout]),
                    Actions =
                    [
                        new AIPlannerActionProposal
                        {
                            ActionType = AIPlannerProposalActionTypes.DeleteWorkout,
                            Summary = $"Delete workout on {firstDate:yyyy-MM-dd}",
                            TargetWorkoutId = firstWorkoutId,
                            TargetDate = firstDate.ToString("yyyy-MM-dd"),
                            BeforeStateFingerprint = AIPlannerProposalFingerprint.ComputeWorkoutFingerprint(firstWorkout),
                        },
                        new AIPlannerActionProposal
                        {
                            ActionType = AIPlannerProposalActionTypes.DeleteWorkout,
                            Summary = $"Delete workout on {secondDate:yyyy-MM-dd}",
                            TargetWorkoutId = secondWorkoutId,
                            TargetDate = secondDate.ToString("yyyy-MM-dd"),
                            BeforeStateFingerprint = AIPlannerProposalFingerprint.ComputeWorkoutFingerprint(secondWorkout),
                        },
                    ],
                },
                CreatedAt = now,
                UpdatedAt = now,
            });

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = [firstWorkout, secondWorkout] });

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

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var mediator = new Mock<IMediator>();
        mediator
            .Setup(x => x.Send(It.IsAny<ConsumeCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf.OneOf<ConsumeCreditsSuccess, ConsumeCreditsError>.FromT0(
                new ConsumeCreditsSuccess(9, 4)));
        mediator
            .Setup(x => x.Send(It.IsAny<DeletePlannedWorkoutCommand>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var sut = new ApplyAIPlannerProposalCommandHandler(
            mediator.Object,
            sessionRepository.Object,
            plannedWorkoutRepository.Object,
            new Mock<IExerciseRepository>().Object,
            traineeRepository.Object,
            userContext.Object);

        var result = await sut.Handle(new ApplyAIPlannerProposalCommand
        {
            TraineeId = traineeId,
            ProposalId = proposalId,
        }, CancellationToken.None);

        Assert.True(result.IsT0);
        Assert.Equal(2, result.AsT0.ActionsApplied);
        mediator.Verify(x => x.Send(It.IsAny<DeletePlannedWorkoutCommand>(), It.IsAny<CancellationToken>()), Times.Exactly(2));
    }
}
