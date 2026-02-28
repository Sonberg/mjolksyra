using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Blocks.ApplyBlock;

namespace Mjolksyra.UseCases.Tests.Blocks;

public class ApplyBlockCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserMissing_DoesNothing()
    {
        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync((Guid?)null);

        var blockRepository = new Mock<IBlockRepository>();
        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        var traineeRepository = new Mock<ITraineeRepository>();

        var sut = new ApplyBlockCommandHandler(
            blockRepository.Object,
            plannedWorkoutRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        await sut.Handle(new ApplyBlockCommand
        {
            BlockId = Guid.NewGuid(),
            TraineeId = Guid.NewGuid(),
            StartDate = new DateOnly(2026, 2, 2)
        }, CancellationToken.None);

        blockRepository.Verify(x => x.Get(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenAuthorized_ReplacesExistingWorkoutsWithBlockWorkouts()
    {
        var userId = Guid.NewGuid();
        var blockId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var block = new Block
        {
            Id = blockId,
            CoachId = userId,
            Name = "Block A",
            NumberOfWeeks = 1,
            Workouts =
            [
                new BlockWorkout
                {
                    Id = Guid.NewGuid(),
                    Week = 1,
                    DayOfWeek = 1,
                    Name = "W1",
                    Note = "N1",
                    Exercises =
                    [
                        new BlockExercise
                        {
                            Id = Guid.NewGuid(),
                            Name = "Exercise",
                            ExerciseId = Guid.NewGuid(),
                            Note = "Note"
                        }
                    ]
                }
            ],
            CreatedAt = DateTimeOffset.UtcNow
        };

        var blockRepository = new Mock<IBlockRepository>();
        blockRepository.Setup(x => x.Get(blockId, It.IsAny<CancellationToken>())).ReturnsAsync(block);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.HasAccess(traineeId, userId, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var existingWorkout = new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            Exercises = [],
            PlannedAt = new DateOnly(2026, 2, 2),
            CreatedAt = DateTimeOffset.UtcNow
        };

        var plannedWorkoutRepository = new Mock<IPlannedWorkoutRepository>();
        plannedWorkoutRepository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data = [existingWorkout],
                Cursor = null
            });
        plannedWorkoutRepository
            .Setup(x => x.Create(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannedWorkout p, CancellationToken _) => p);

        var sut = new ApplyBlockCommandHandler(
            blockRepository.Object,
            plannedWorkoutRepository.Object,
            traineeRepository.Object,
            userContext.Object);

        await sut.Handle(new ApplyBlockCommand
        {
            BlockId = blockId,
            TraineeId = traineeId,
            StartDate = new DateOnly(2026, 2, 2)
        }, CancellationToken.None);

        plannedWorkoutRepository.Verify(x => x.Delete(existingWorkout.Id, It.IsAny<CancellationToken>()), Times.Once);
        plannedWorkoutRepository.Verify(x => x.Create(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()), Times.Once);
    }
}

