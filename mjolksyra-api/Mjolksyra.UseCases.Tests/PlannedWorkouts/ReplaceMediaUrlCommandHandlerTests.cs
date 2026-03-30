using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.PlannedWorkouts.ReplaceMediaUrl;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class ReplaceMediaUrlCommandHandlerTests
{
    [Fact]
    public async Task Handle_SetsCompressedUrlOnMatchingItem()
    {
        var workoutId = Guid.NewGuid();
        var rawUrl = "https://utfs.io/f/abc123?raw=1";
        var compressedUrl = "https://r2.example.com/workouts/compressed.webp";
        var otherRaw = "https://utfs.io/f/other?raw=1";

        var workout = CreateWorkout(workoutId, [rawUrl, otherRaw]);

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
            OldUrl = rawUrl,
            CompressedUrl = compressedUrl,
        }, CancellationToken.None);

        Assert.NotNull(saved);
        var item = saved!.Media.Single(m => m.RawUrl == rawUrl);
        Assert.Equal(compressedUrl, item.CompressedUrl);
        // Other item unaffected
        var other = saved.Media.Single(m => m.RawUrl == otherRaw);
        Assert.Null(other.CompressedUrl);
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
            CompressedUrl = "https://r2.example.com/workouts/new.webp",
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
            CompressedUrl = "https://r2.example.com/workouts/def.webp",
        }, CancellationToken.None);

        repository.Verify(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    private static PlannedWorkout CreateWorkout(Guid id, ICollection<string> rawUrls) =>
        new()
        {
            Id = id,
            TraineeId = Guid.NewGuid(),
            PlannedAt = new DateOnly(2026, 3, 15),
            Exercises = [],
            CreatedAt = DateTimeOffset.UtcNow,
            Media = rawUrls.Select(u => new PlannedWorkoutMedia { RawUrl = u }).ToList(),
        };
}
