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
    public async Task GetUpcomingWorkoutsAsync_ReturnsWorkoutsAfterFromDate()
    {
        var traineeId = Guid.NewGuid();
        var repository = new Mock<IPlannedWorkoutRepository>();
        repository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data =
                [
                    BuildWorkout(traineeId, new DateOnly(2026, 4, 8)),
                    BuildWorkout(traineeId, new DateOnly(2026, 4, 10)),
                ],
            });

        var sut = new AIPlannerToolDispatcher(
            repository.Object,
            new Mock<ICompletedWorkoutRepository>().Object,
            new Mock<IWorkoutMediaAnalysisRepository>().Object,
            new Mock<IExerciseRepository>().Object,
            new Mock<IPlannedWorkoutDeletedPublisher>().Object,
            new Mock<ITraineeInsightsRepository>().Object,
            new Mock<ICoachInsightsRepository>().Object,
            traineeId,
            Guid.NewGuid());

        var result = await sut.GetUpcomingWorkoutsAsync("2026-04-07", 10, CancellationToken.None);

        using var doc = JsonDocument.Parse(result);
        var entries = doc.RootElement.EnumerateArray().ToList();
        Assert.Equal(2, entries.Count);
        Assert.Equal("2026-04-08", entries[0].GetProperty("date").GetString());
        Assert.Equal("2026-04-10", entries[1].GetProperty("date").GetString());
    }

    [Fact]
    public async Task GetUpcomingWorkoutDetailsAsync_ReturnsFutureWorkoutsWithExercises()
    {
        var traineeId = Guid.NewGuid();
        var exerciseId = Guid.NewGuid();
        var repository = new Mock<IPlannedWorkoutRepository>();
        repository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>
            {
                Data =
                [
                    BuildWorkout(traineeId, new DateOnly(2026, 4, 10), exerciseId: exerciseId),
                ],
            });

        var sut = new AIPlannerToolDispatcher(
            repository.Object,
            new Mock<ICompletedWorkoutRepository>().Object,
            new Mock<IWorkoutMediaAnalysisRepository>().Object,
            new Mock<IExerciseRepository>().Object,
            new Mock<IPlannedWorkoutDeletedPublisher>().Object,
            new Mock<ITraineeInsightsRepository>().Object,
            new Mock<ICoachInsightsRepository>().Object,
            traineeId,
            Guid.NewGuid());

        var result = await sut.GetUpcomingWorkoutDetailsAsync("2026-04-07", 10, CancellationToken.None);

        using var doc = JsonDocument.Parse(result);
        var entries = doc.RootElement.EnumerateArray().ToList();
        Assert.Single(entries);
        Assert.Equal("2026-04-10", entries[0].GetProperty("plannedAt").GetString());
        var exercises = entries[0].GetProperty("exercises").EnumerateArray().ToList();
        Assert.Single(exercises);
    }

    private static PlannedWorkout BuildWorkout(Guid traineeId, DateOnly plannedAt, Guid? exerciseId = null)
    {
        return new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            PlannedAt = plannedAt,
            CreatedAt = DateTimeOffset.UtcNow,
            PublishedExercises = exerciseId.HasValue
                ?
                [
                    new PlannedExercise
                    {
                        Id = Guid.NewGuid(),
                        ExerciseId = exerciseId,
                        Name = "Bench Press",
                    }
                ]
                : [],
        };
    }
}
