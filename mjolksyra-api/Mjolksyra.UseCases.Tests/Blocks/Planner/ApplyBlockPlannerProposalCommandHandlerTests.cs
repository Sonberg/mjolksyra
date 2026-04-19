using MediatR;
using Moq;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Blocks.Planner.ApplyBlockPlannerProposal;
using Mjolksyra.UseCases.Coaches.ConsumeCredits;
using OneOf;

namespace Mjolksyra.UseCases.Tests.Blocks.Planner;

public class ApplyBlockPlannerProposalCommandHandlerTests
{
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _blockId = Guid.NewGuid();
    private readonly Guid _proposalId = Guid.NewGuid();

    private readonly Mock<IMediator> _mediator = new();
    private readonly Mock<IBlockPlannerSessionRepository> _sessionRepo = new();
    private readonly Mock<IBlockRepository> _blockRepo = new();
    private readonly Mock<IExerciseRepository> _exerciseRepo = new();
    private readonly Mock<IUserContext> _userContext = new();

    public ApplyBlockPlannerProposalCommandHandlerTests()
    {
        _userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>()))
            .ReturnsAsync(_userId);

        _exerciseRepo
            .Setup(x => x.GetMany(It.IsAny<ICollection<Guid>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);
        _exerciseRepo
            .Setup(x => x.Search(It.IsAny<string>(), It.IsAny<ICollection<ExerciseSport>>(), It.IsAny<ICollection<ExerciseLevel>>(), It.IsAny<Guid?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([]);

        _mediator.Setup(x => x.Send(It.IsAny<ConsumeCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf<ConsumeCreditsSuccess, ConsumeCreditsError>.FromT0(new ConsumeCreditsSuccess(10, 5)));
    }

    private ApplyBlockPlannerProposalCommandHandler BuildSut() => new(
        _mediator.Object,
        _sessionRepo.Object,
        _blockRepo.Object,
        _exerciseRepo.Object,
        _userContext.Object);

    private BlockPlannerSession BuildSession(BlockPlannerActionSet proposal) => new()
    {
        Id = Guid.NewGuid(),
        BlockId = _blockId,
        CoachUserId = _userId,
        Description = "test",
        ProposedActionSet = proposal,
        CreatedAt = DateTimeOffset.UtcNow,
        UpdatedAt = DateTimeOffset.UtcNow,
    };

    private Block BuildBlock(params BlockWorkout[] workouts) => new()
    {
        Id = _blockId,
        CoachId = _userId,
        Name = "Test Block",
        NumberOfWeeks = 4,
        Workouts = workouts.ToList(),
        CreatedAt = DateTimeOffset.UtcNow,
    };

    private static BlockWorkout WorkoutAt(int week, int dayOfWeek, params BlockExercise[] exercises) => new()
    {
        Id = Guid.NewGuid(),
        Week = week,
        DayOfWeek = dayOfWeek,
        Name = $"W{week}D{dayOfWeek}",
        Exercises = exercises.ToList(),
    };

    private static BlockExercise Exercise(string name) => new()
    {
        Id = Guid.NewGuid(),
        Name = name,
        ExerciseId = Guid.NewGuid(),
    };

    private BlockPlannerActionSet PendingProposal(params BlockPlannerActionProposal[] actions) => new()
    {
        Id = _proposalId,
        Status = AIPlannerProposalStatus.Pending,
        Summary = "Test proposal",
        CreditCost = 1,
        Actions = actions.ToList(),
        CreatedAt = DateTimeOffset.UtcNow,
    };

    private void SetupSession(BlockPlannerActionSet proposal)
    {
        var session = BuildSession(proposal);
        _sessionRepo
            .Setup(x => x.GetByProposalId(_proposalId, _userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(session);
        _sessionRepo
            .Setup(x => x.Update(It.IsAny<BlockPlannerSession>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
    }

    // ── add_block_exercise ──────────────────────────────────────────────────

    [Fact]
    public async Task AddBlockExercise_AppendsToExistingExercises_PreservingOriginals()
    {
        var existingExercise = Exercise("Squat");
        var workout = WorkoutAt(1, 1, existingExercise);
        var block = BuildBlock(workout);

        var proposal = PendingProposal(new BlockPlannerActionProposal
        {
            ActionType = BlockPlannerProposalActionTypes.AddBlockExercise,
            Summary = "Add accessory",
            TargetWeek = 1,
            TargetDayOfWeek = 1,
            Workout = new BlockWorkoutRequestPayload
            {
                Week = 1,
                DayOfWeek = 1,
                Exercises =
                [
                    new PlannedExerciseRequestPayload { Name = "Romanian Deadlift", Sets = [] },
                ]
            },
        });

        SetupSession(proposal);
        _blockRepo.Setup(x => x.Get(_blockId, It.IsAny<CancellationToken>())).ReturnsAsync(block);
        _blockRepo.Setup(x => x.Update(It.IsAny<Block>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

        var result = await BuildSut().Handle(
            new ApplyBlockPlannerProposalCommand { BlockId = _blockId, ProposalId = _proposalId },
            CancellationToken.None);

        _blockRepo.Verify(x => x.Update(It.Is<Block>(b =>
            b.Workouts.Single(w => w.Week == 1 && w.DayOfWeek == 1).Exercises.Count == 2 &&
            b.Workouts.Single(w => w.Week == 1 && w.DayOfWeek == 1).Exercises.Any(e => e.Name == "Squat") &&
            b.Workouts.Single(w => w.Week == 1 && w.DayOfWeek == 1).Exercises.Any(e => e.Name == "Romanian Deadlift")
        ), It.IsAny<CancellationToken>()), Times.Once);

        Assert.True(result.IsT0);
        Assert.Equal(1, result.AsT0.ActionsApplied);
    }

    [Fact]
    public async Task AddBlockExercise_WhenTargetWorkoutMissing_SkipsAction()
    {
        var block = BuildBlock(); // no workouts
        var proposal = PendingProposal(new BlockPlannerActionProposal
        {
            ActionType = BlockPlannerProposalActionTypes.AddBlockExercise,
            Summary = "Add to missing workout",
            TargetWeek = 1,
            TargetDayOfWeek = 1,
            Workout = new BlockWorkoutRequestPayload
            {
                Week = 1,
                DayOfWeek = 1,
                Exercises = [new PlannedExerciseRequestPayload { Name = "Squat", Sets = [] }]
            },
        });

        SetupSession(proposal);
        _blockRepo.Setup(x => x.Get(_blockId, It.IsAny<CancellationToken>())).ReturnsAsync(block);
        _blockRepo.Setup(x => x.Update(It.IsAny<Block>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

        var result = await BuildSut().Handle(
            new ApplyBlockPlannerProposalCommand { BlockId = _blockId, ProposalId = _proposalId },
            CancellationToken.None);

        Assert.True(result.IsT0);
        Assert.Equal(0, result.AsT0.ActionsApplied);
    }

    // ── update_block_exercise ───────────────────────────────────────────────

    [Fact]
    public async Task UpdateBlockExercise_ReplacesTargetExercise_PreservingOthers()
    {
        var keepExercise = Exercise("Bench Press");
        var updateExercise = Exercise("Squat");
        var workout = WorkoutAt(1, 1, keepExercise, updateExercise);
        var block = BuildBlock(workout);

        var proposal = PendingProposal(new BlockPlannerActionProposal
        {
            ActionType = BlockPlannerProposalActionTypes.UpdateBlockExercise,
            Summary = "Update squat sets",
            TargetWeek = 1,
            TargetDayOfWeek = 1,
            Workout = new BlockWorkoutRequestPayload
            {
                Week = 1,
                DayOfWeek = 1,
                Exercises =
                [
                    new PlannedExerciseRequestPayload
                    {
                        Id = updateExercise.Id,
                        Name = "Squat",
                        Sets = [new AIPlannerSetOutput { Reps = 5, WeightKg = 100 }]
                    },
                ]
            },
        });

        SetupSession(proposal);
        _blockRepo.Setup(x => x.Get(_blockId, It.IsAny<CancellationToken>())).ReturnsAsync(block);
        _blockRepo.Setup(x => x.Update(It.IsAny<Block>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

        var result = await BuildSut().Handle(
            new ApplyBlockPlannerProposalCommand { BlockId = _blockId, ProposalId = _proposalId },
            CancellationToken.None);

        _blockRepo.Verify(x => x.Update(It.Is<Block>(b =>
            b.Workouts.Single(w => w.Week == 1 && w.DayOfWeek == 1).Exercises.Count == 2 &&
            b.Workouts.Single(w => w.Week == 1 && w.DayOfWeek == 1).Exercises.Any(e => e.Name == "Bench Press") &&
            b.Workouts.Single(w => w.Week == 1 && w.DayOfWeek == 1).Exercises
                .Single(e => e.Id == updateExercise.Id).Prescription!.Sets!.First().Target!.Reps == 5
        ), It.IsAny<CancellationToken>()), Times.Once);

        Assert.True(result.IsT0);
        Assert.Equal(1, result.AsT0.ActionsApplied);
    }

    // ── delete_block_exercise ───────────────────────────────────────────────

    [Fact]
    public async Task DeleteBlockExercise_ByTargetExerciseId_RemovesOnlyThatExercise()
    {
        var keepExercise = Exercise("Bench Press");
        var deleteExercise = Exercise("Squat");
        var workout = WorkoutAt(1, 1, keepExercise, deleteExercise);
        var block = BuildBlock(workout);

        var proposal = PendingProposal(new BlockPlannerActionProposal
        {
            ActionType = BlockPlannerProposalActionTypes.DeleteBlockExercise,
            Summary = "Remove squat",
            TargetWeek = 1,
            TargetDayOfWeek = 1,
            TargetExerciseId = deleteExercise.Id,
        });

        SetupSession(proposal);
        _blockRepo.Setup(x => x.Get(_blockId, It.IsAny<CancellationToken>())).ReturnsAsync(block);
        _blockRepo.Setup(x => x.Update(It.IsAny<Block>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

        var result = await BuildSut().Handle(
            new ApplyBlockPlannerProposalCommand { BlockId = _blockId, ProposalId = _proposalId },
            CancellationToken.None);

        _blockRepo.Verify(x => x.Update(It.Is<Block>(b =>
            b.Workouts.Single(w => w.Week == 1 && w.DayOfWeek == 1).Exercises.Count == 1 &&
            b.Workouts.Single(w => w.Week == 1 && w.DayOfWeek == 1).Exercises.Single().Name == "Bench Press"
        ), It.IsAny<CancellationToken>()), Times.Once);

        Assert.True(result.IsT0);
        Assert.Equal(1, result.AsT0.ActionsApplied);
    }

    // ── create_block_workout ────────────────────────────────────────────────

    [Fact]
    public async Task CreateBlockWorkout_AddsNewWorkout()
    {
        var block = BuildBlock();
        var proposal = PendingProposal(new BlockPlannerActionProposal
        {
            ActionType = BlockPlannerProposalActionTypes.CreateBlockWorkout,
            Summary = "Create workout",
            TargetWeek = 1,
            TargetDayOfWeek = 1,
            Workout = new BlockWorkoutRequestPayload
            {
                Week = 1,
                DayOfWeek = 1,
                Name = "Lower A",
                Exercises =
                [
                    new PlannedExerciseRequestPayload { Name = "Squat", Sets = [new AIPlannerSetOutput { Reps = 5 }] },
                ]
            },
        });

        SetupSession(proposal);
        _blockRepo.Setup(x => x.Get(_blockId, It.IsAny<CancellationToken>())).ReturnsAsync(block);
        _blockRepo.Setup(x => x.Update(It.IsAny<Block>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

        var result = await BuildSut().Handle(
            new ApplyBlockPlannerProposalCommand { BlockId = _blockId, ProposalId = _proposalId },
            CancellationToken.None);

        _blockRepo.Verify(x => x.Update(It.Is<Block>(b =>
            b.Workouts.Count == 1 &&
            b.Workouts.Single().Week == 1 &&
            b.Workouts.Single().DayOfWeek == 1 &&
            b.Workouts.Single().Name == "Lower A" &&
            b.Workouts.Single().Exercises.Count == 1
        ), It.IsAny<CancellationToken>()), Times.Once);

        Assert.True(result.IsT0);
        Assert.Equal(1, result.AsT0.ActionsApplied);
    }

    [Fact]
    public async Task CreateBlockWorkout_WhenSlotOccupied_ReplacesExistingWorkout()
    {
        var existing = WorkoutAt(1, 1, Exercise("Old Exercise"));
        var block = BuildBlock(existing);

        var proposal = PendingProposal(new BlockPlannerActionProposal
        {
            ActionType = BlockPlannerProposalActionTypes.CreateBlockWorkout,
            Summary = "Replace workout",
            TargetWeek = 1,
            TargetDayOfWeek = 1,
            Workout = new BlockWorkoutRequestPayload
            {
                Week = 1,
                DayOfWeek = 1,
                Name = "New Workout",
                Exercises = [new PlannedExerciseRequestPayload { Name = "Deadlift", Sets = [] }]
            },
        });

        SetupSession(proposal);
        _blockRepo.Setup(x => x.Get(_blockId, It.IsAny<CancellationToken>())).ReturnsAsync(block);
        _blockRepo.Setup(x => x.Update(It.IsAny<Block>(), It.IsAny<CancellationToken>())).Returns(Task.CompletedTask);

        await BuildSut().Handle(
            new ApplyBlockPlannerProposalCommand { BlockId = _blockId, ProposalId = _proposalId },
            CancellationToken.None);

        _blockRepo.Verify(x => x.Update(It.Is<Block>(b =>
            b.Workouts.Count == 1 &&
            b.Workouts.Single().Name == "New Workout"
        ), It.IsAny<CancellationToken>()), Times.Once);
    }

    // ── auth / guards ───────────────────────────────────────────────────────

    [Fact]
    public async Task Handle_WhenUserMissing_ReturnsForbidden()
    {
        _userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);

        var result = await BuildSut().Handle(
            new ApplyBlockPlannerProposalCommand { BlockId = _blockId, ProposalId = _proposalId },
            CancellationToken.None);

        Assert.True(result.IsT1);
    }

    [Fact]
    public async Task Handle_WhenBlockNotOwnedByUser_ReturnsForbidden()
    {
        var block = BuildBlock();
        block.CoachId = Guid.NewGuid(); // different owner

        _blockRepo.Setup(x => x.Get(_blockId, It.IsAny<CancellationToken>())).ReturnsAsync(block);

        var result = await BuildSut().Handle(
            new ApplyBlockPlannerProposalCommand { BlockId = _blockId, ProposalId = _proposalId },
            CancellationToken.None);

        Assert.True(result.IsT1);
    }

    [Fact]
    public async Task Handle_WhenInsufficientCredits_ReturnsInsufficientCredits()
    {
        var block = BuildBlock();
        var proposal = PendingProposal();
        proposal.CreditCost = 5;

        SetupSession(proposal);
        _blockRepo.Setup(x => x.Get(_blockId, It.IsAny<CancellationToken>())).ReturnsAsync(block);
        _mediator
            .Setup(x => x.Send(It.IsAny<ConsumeCreditsCommand>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(OneOf<ConsumeCreditsSuccess, ConsumeCreditsError>.FromT1(new ConsumeCreditsError("Not enough credits")));

        var result = await BuildSut().Handle(
            new ApplyBlockPlannerProposalCommand { BlockId = _blockId, ProposalId = _proposalId },
            CancellationToken.None);

        Assert.True(result.IsT2);
    }
}
