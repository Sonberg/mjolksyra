using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Blocks;
using Mjolksyra.UseCases.Blocks.DeleteBlock;
using Mjolksyra.UseCases.Blocks.GetBlock;
using Mjolksyra.UseCases.Blocks.UpdateBlock;

namespace Mjolksyra.UseCases.Tests.Blocks;

public class BlockHandlersTests
{
    [Fact]
    public async Task DeleteBlock_WhenNotOwner_DoesNotDelete()
    {
        var block = new Block
        {
            Id = Guid.NewGuid(),
            CoachId = Guid.NewGuid(),
            Name = "Block",
            NumberOfWeeks = 1,
            Workouts = [],
            CreatedAt = DateTimeOffset.UtcNow
        };

        var blockRepository = new Mock<IBlockRepository>();
        blockRepository.Setup(x => x.Get(block.Id, It.IsAny<CancellationToken>())).ReturnsAsync(block);

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(Guid.NewGuid());

        var sut = new DeleteBlockCommandHandler(blockRepository.Object, userContext.Object);
        await sut.Handle(new DeleteBlockCommand { BlockId = block.Id }, CancellationToken.None);

        blockRepository.Verify(x => x.Delete(It.IsAny<Guid>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task GetBlock_WhenOwner_ReturnsBlockResponse()
    {
        var userId = Guid.NewGuid();
        var block = new Block
        {
            Id = Guid.NewGuid(),
            CoachId = userId,
            Name = "Block",
            NumberOfWeeks = 1,
            Workouts = [],
            CreatedAt = DateTimeOffset.UtcNow
        };

        var blockRepository = new Mock<IBlockRepository>();
        blockRepository.Setup(x => x.Get(block.Id, It.IsAny<CancellationToken>())).ReturnsAsync(block);

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var sut = new GetBlockRequestHandler(blockRepository.Object, userContext.Object);
        var result = await sut.Handle(new GetBlockRequest { BlockId = block.Id }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal(block.Id, result!.Id);
    }

    [Fact]
    public async Task UpdateBlock_WhenOwner_UpdatesAndPersists()
    {
        var userId = Guid.NewGuid();
        var block = new Block
        {
            Id = Guid.NewGuid(),
            CoachId = userId,
            Name = "Old",
            NumberOfWeeks = 1,
            Workouts = [],
            CreatedAt = DateTimeOffset.UtcNow
        };

        var blockRepository = new Mock<IBlockRepository>();
        blockRepository.Setup(x => x.Get(block.Id, It.IsAny<CancellationToken>())).ReturnsAsync(block);

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUserId(It.IsAny<CancellationToken>())).ReturnsAsync(userId);

        var sut = new UpdateBlockCommandHandler(blockRepository.Object, userContext.Object);

        var result = await sut.Handle(new UpdateBlockCommand
        {
            BlockId = block.Id,
            Block = new BlockRequest
            {
                Name = "New",
                NumberOfWeeks = 2,
                Workouts =
                [
                    new BlockWorkoutRequest
                    {
                        Id = Guid.Empty,
                        Name = "W",
                        Note = null,
                        Week = 1,
                        DayOfWeek = 1,
                        Exercises =
                        [
                            new BlockExerciseRequest
                            {
                                Id = Guid.Empty,
                                Name = "E",
                                ExerciseId = null,
                                Note = null
                            }
                        ]
                    }
                ]
            }
        }, CancellationToken.None);

        Assert.NotNull(result);
        Assert.Equal("New", block.Name);
        Assert.Equal(2, block.NumberOfWeeks);
        Assert.NotEqual(Guid.Empty, block.Workouts.First().Id);
        Assert.NotEqual(Guid.Empty, block.Workouts.First().Exercises.First().Id);
        blockRepository.Verify(x => x.Update(block, It.IsAny<CancellationToken>()), Times.Once);
    }
}

