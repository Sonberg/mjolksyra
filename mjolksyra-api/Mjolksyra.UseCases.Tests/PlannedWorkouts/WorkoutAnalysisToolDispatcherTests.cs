using System.Text.Json;
using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

namespace Mjolksyra.UseCases.Tests.PlannedWorkouts;

public class WorkoutAnalysisToolDispatcherTests
{
    [Fact]
    public async Task GetRecentCompletedWorkouts_BuildsCursorWithCompletedOnlyAndCorrectToDate()
    {
        var traineeId = Guid.NewGuid();
        var repository = new Mock<IPlannedWorkoutRepository>();

        repository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>());

        var sut = new WorkoutAnalysisToolDispatcher(repository.Object, traineeId);

        await sut.GetRecentCompletedWorkoutsAsync("2026-04-05", 3, CancellationToken.None);

        repository.Verify(x => x.Get(
            It.Is<PlannedWorkoutCursor>(c =>
                c.TraineeId == traineeId &&
                c.CompletedOnly == true &&
                c.ToDate == new DateOnly(2026, 4, 4) &&
                c.Size == 3 &&
                c.Order == SortOrder.Desc),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetRecentCompletedWorkouts_ReturnsSerializedProgressionEntries()
    {
        var traineeId = Guid.NewGuid();
        var repository = new Mock<IPlannedWorkoutRepository>();

        var workouts = new List<PlannedWorkout>
        {
            new()
            {
                Id = Guid.NewGuid(),
                TraineeId = traineeId,
                PlannedAt = new DateOnly(2026, 3, 30),
                CreatedAt = DateTimeOffset.UtcNow,
                CompletedAt = DateTimeOffset.UtcNow.AddDays(-1),
                Exercises =
                [
                    new PlannedExercise
                    {
                        Id = Guid.NewGuid(),
                        Name = "Bench Press",
                        Prescription = new ExercisePrescription
                        {
                            Sets =
                            [
                                new ExercisePrescriptionSet
                                {
                                    Target = new ExercisePrescriptionSetTarget { Reps = 5, WeightKg = 80 },
                                    Actual = new ExercisePrescriptionSetActual { Reps = 5, WeightKg = 80, IsDone = true },
                                }
                            ]
                        }
                    }
                ]
            }
        };

        repository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = workouts });

        var sut = new WorkoutAnalysisToolDispatcher(repository.Object, traineeId);

        var result = await sut.GetRecentCompletedWorkoutsAsync("2026-04-05", 5, CancellationToken.None);

        using var doc = JsonDocument.Parse(result);
        var entries = doc.RootElement.EnumerateArray().ToList();
        Assert.Single(entries);
        Assert.Equal("2026-03-30", entries[0].GetProperty("date").GetString());

        var exercises = entries[0].GetProperty("exercises").EnumerateArray().ToList();
        Assert.Single(exercises);
        Assert.Equal("Bench Press", exercises[0].GetProperty("name").GetString());
    }

    [Fact]
    public async Task GetWorkoutsForExercise_FiltersToMatchingExercisesCaseInsensitive()
    {
        var traineeId = Guid.NewGuid();
        var repository = new Mock<IPlannedWorkoutRepository>();

        var workouts = new List<PlannedWorkout>
        {
            BuildWorkout(traineeId, "Back Squat"),
            BuildWorkout(traineeId, "Bench Press"),
            BuildWorkout(traineeId, "back squat"),
        };

        repository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = workouts });

        var sut = new WorkoutAnalysisToolDispatcher(repository.Object, traineeId);

        var result = await sut.GetWorkoutsForExerciseAsync("Back Squat", 5, null, null, CancellationToken.None);

        using var doc = JsonDocument.Parse(result);
        var entries = doc.RootElement.EnumerateArray().ToList();
        Assert.Equal(2, entries.Count);
    }

    [Fact]
    public async Task GetWorkoutsForExercise_RespectsCountCap()
    {
        var traineeId = Guid.NewGuid();
        var repository = new Mock<IPlannedWorkoutRepository>();

        var workouts = Enumerable.Range(0, 20)
            .Select(_ => BuildWorkout(traineeId, "Deadlift"))
            .ToList();

        repository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = workouts });

        var sut = new WorkoutAnalysisToolDispatcher(repository.Object, traineeId);

        var result = await sut.GetWorkoutsForExerciseAsync("Deadlift", 15, null, null, CancellationToken.None);

        using var doc = JsonDocument.Parse(result);
        var entries = doc.RootElement.EnumerateArray().ToList();
        Assert.Equal(10, entries.Count);
    }

    [Fact]
    public async Task GetWorkoutsForExercise_WithBeforeDate_QueriesCompletedOnlyWithToDate()
    {
        var traineeId = Guid.NewGuid();
        var repository = new Mock<IPlannedWorkoutRepository>();

        repository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>());

        var sut = new WorkoutAnalysisToolDispatcher(repository.Object, traineeId);

        await sut.GetWorkoutsForExerciseAsync("Bench Press", 5, "2026-04-05", null, CancellationToken.None);

        repository.Verify(x => x.Get(
            It.Is<PlannedWorkoutCursor>(c =>
                c.ToDate == new DateOnly(2026, 4, 5) &&
                c.FromDate == null &&
                c.CompletedOnly == true &&
                c.Order == SortOrder.Desc),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetWorkoutsForExercise_WithAfterDate_QueriesAllWorkoutsAscending()
    {
        var traineeId = Guid.NewGuid();
        var repository = new Mock<IPlannedWorkoutRepository>();

        repository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>());

        var sut = new WorkoutAnalysisToolDispatcher(repository.Object, traineeId);

        await sut.GetWorkoutsForExerciseAsync("Squat", 5, null, "2026-04-06", CancellationToken.None);

        repository.Verify(x => x.Get(
            It.Is<PlannedWorkoutCursor>(c =>
                c.FromDate == new DateOnly(2026, 4, 6) &&
                c.ToDate == null &&
                c.CompletedOnly == null &&
                c.Order == SortOrder.Asc),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetWorkoutsForExercise_ResponseIncludesCompletedFlag()
    {
        var traineeId = Guid.NewGuid();
        var repository = new Mock<IPlannedWorkoutRepository>();

        var workouts = new List<PlannedWorkout>
        {
            BuildWorkout(traineeId, "Squat", completed: true),
            BuildWorkout(traineeId, "Squat", completed: false),
        };

        repository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout> { Data = workouts });

        var sut = new WorkoutAnalysisToolDispatcher(repository.Object, traineeId);

        var result = await sut.GetWorkoutsForExerciseAsync("Squat", 5, null, null, CancellationToken.None);

        using var doc = JsonDocument.Parse(result);
        var entries = doc.RootElement.EnumerateArray().ToList();
        Assert.True(entries[0].GetProperty("completed").GetBoolean());
        Assert.False(entries[1].GetProperty("completed").GetBoolean());
    }

    [Fact]
    public async Task GetRecentCompletedWorkouts_RespectsCountCap()
    {
        var traineeId = Guid.NewGuid();
        var repository = new Mock<IPlannedWorkoutRepository>();

        repository
            .Setup(x => x.Get(It.IsAny<PlannedWorkoutCursor>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Paginated<PlannedWorkout>());

        var sut = new WorkoutAnalysisToolDispatcher(repository.Object, traineeId);

        await sut.GetRecentCompletedWorkoutsAsync("2026-04-05", 99, CancellationToken.None);

        repository.Verify(x => x.Get(
            It.Is<PlannedWorkoutCursor>(c => c.Size == 10),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    private static PlannedWorkout BuildWorkout(Guid traineeId, string exerciseName, bool completed = true)
    {
        return new PlannedWorkout
        {
            Id = Guid.NewGuid(),
            TraineeId = traineeId,
            PlannedAt = new DateOnly(2026, 3, 1),
            CreatedAt = DateTimeOffset.UtcNow,
            CompletedAt = completed ? DateTimeOffset.UtcNow : null,
            Exercises =
            [
                new PlannedExercise
                {
                    Id = Guid.NewGuid(),
                    Name = exerciseName,
                }
            ]
        };
    }
}
