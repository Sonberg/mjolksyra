using System.Text.Json;
using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class AIPlannerToolDispatcherTests
{
    [Fact]
    public async Task GetUpcomingWorkoutsAsync_ExcludesCompletedWorkouts()
    {
        var traineeId = Guid.NewGuid();
        var repository = new Mock<IPlannedWorkoutRepository>();
        repository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data =
                [
                    BuildWorkout(traineeId, new DateOnly(2026, 4, 8), completed: false),
                    BuildWorkout(traineeId, new DateOnly(2026, 4, 9), completed: true),
                ],
            });

        var sut = new AIPlannerToolDispatcher(
            repository.Object,
            new Mock<IWorkoutMediaAnalysisRepository>().Object,
            new Mock<IExerciseRepository>().Object,
            new Mock<IPlannedWorkoutDeletedPublisher>().Object,
            traineeId);

        var result = await sut.GetUpcomingWorkoutsAsync("2026-04-07", 10, CancellationToken.None);

        using var doc = JsonDocument.Parse(result);
        var entries = doc.RootElement.EnumerateArray().ToList();
        Assert.Single(entries);
        Assert.Equal("2026-04-08", entries[0].GetProperty("date").GetString());
    }

    [Fact]
    public async Task GetUpcomingWorkoutDetailsAsync_ExcludesCompletedWorkouts()
    {
        var traineeId = Guid.NewGuid();
        var repository = new Mock<IPlannedWorkoutRepository>();
        repository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data =
                [
                    BuildWorkout(traineeId, new DateOnly(2026, 4, 8), completed: true),
                    BuildWorkout(traineeId, new DateOnly(2026, 4, 10), completed: false),
                ],
            });

        var sut = new AIPlannerToolDispatcher(
            repository.Object,
            new Mock<IWorkoutMediaAnalysisRepository>().Object,
            new Mock<IExerciseRepository>().Object,
            new Mock<IPlannedWorkoutDeletedPublisher>().Object,
            traineeId);

        var result = await sut.GetUpcomingWorkoutDetailsAsync("2026-04-07", 10, CancellationToken.None);

        using var doc = JsonDocument.Parse(result);
        var entries = doc.RootElement.EnumerateArray().ToList();
        Assert.Single(entries);
        Assert.Equal("2026-04-10", entries[0].GetProperty("plannedAt").GetString());
    }

    private static PlannedWorkout BuildWorkout(Guid traineeId, DateOnly plannedAt, bool completed)
    {
        return new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            PlannedAt = plannedAt,
            CreatedAt = DateTimeOffset.UtcNow,
            CompletedAt = completed ? DateTimeOffset.UtcNow : null,
            Exercises = [],
        };
    }
}
