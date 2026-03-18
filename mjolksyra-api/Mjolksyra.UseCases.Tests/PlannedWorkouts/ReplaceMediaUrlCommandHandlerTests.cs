using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.PlannedWorkouts.ReplaceMediaUrl;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class ReplaceMediaUrlCommandHandlerTests
{
    [Fact]
    public async Task Handle_ReplacesOldUrlWithNewUrl()
    {
        var workoutId = Guid.NewGuid();
        var oldUrl = "https://utfs.io/f/abc123?raw=1";
        var newUrl = "https://utfs.io/f/def456";

        var workout = CreateWorkout(workoutId, [oldUrl, "https://utfs.io/f/other"]);

        PlannedWorkout? saved = null;
        var repository = new Mock<IPlannedWorkoutRepository>();
        repository.Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>())).ReturnsAsync(workout);
        repository.Setup(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()))
            .Callback<PlannedWorkout, CancellationToken>((w, _) => saved = w);

        var handler = new ReplaceMediaUrlCommandHandler(repository.Object);
        await handler.Handle(new ReplaceMediaUrlCommand
        {
            TraineeId = Guid.NewGuid(),
            PlannedWorkoutId = workoutId,
            OldUrl = oldUrl,
            NewUrl = newUrl,
        }, CancellationToken.None);

        Assert.NotNull(saved);
        Assert.Contains(newUrl, saved!.MediaUrls);
        Assert.DoesNotContain(oldUrl, saved.MediaUrls);
        Assert.Contains("https://utfs.io/f/other", saved.MediaUrls);
    }

    [Fact]
    public async Task Handle_WhenOldUrlNotFound_NoOpIdempotent()
    {
        var workoutId = Guid.NewGuid();
        var workout = CreateWorkout(workoutId, ["https://utfs.io/f/already-compressed"]);

        var repository = new Mock<IPlannedWorkoutRepository>();
        repository.Setup(x => x.Get(workoutId, It.IsAny<CancellationToken>())).ReturnsAsync(workout);

        var handler = new ReplaceMediaUrlCommandHandler(repository.Object);
        await handler.Handle(new ReplaceMediaUrlCommand
        {
            TraineeId = Guid.NewGuid(),
            PlannedWorkoutId = workoutId,
            OldUrl = "https://utfs.io/f/does-not-exist?raw=1",
            NewUrl = "https://utfs.io/f/new",
        }, CancellationToken.None);

        // Update should never be called when the old URL is not found
        repository.Verify(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenWorkoutNotFound_NoOp()
    {
        var repository = new Mock<IPlannedWorkoutRepository>();
        repository.Setup(x => x.Get(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((PlannedWorkout?)null);

        var handler = new ReplaceMediaUrlCommandHandler(repository.Object);
        await handler.Handle(new ReplaceMediaUrlCommand
        {
            TraineeId = Guid.NewGuid(),
            PlannedWorkoutId = Guid.NewGuid(),
            OldUrl = "https://utfs.io/f/abc?raw=1",
            NewUrl = "https://utfs.io/f/def",
        }, CancellationToken.None);

        repository.Verify(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    private static PlannedWorkout CreateWorkout(Guid id, ICollection<string> mediaUrls) =>
        new()
        {
            Id = id,
            TraineeId = Guid.NewGuid(),
            PlannedAt = new DateOnly(2026, 3, 15),
            Exercises = [],
            CreatedAt = DateTimeOffset.UtcNow,
            MediaUrls = mediaUrls,
        };
}
