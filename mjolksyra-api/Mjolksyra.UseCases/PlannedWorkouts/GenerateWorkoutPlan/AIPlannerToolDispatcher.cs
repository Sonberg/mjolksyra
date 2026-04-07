using System.Text.Json;
using System.Text.Json.Serialization;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

namespace Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;

public class AIPlannerToolDispatcher(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IWorkoutMediaAnalysisRepository workoutMediaAnalysisRepository,
    IExerciseRepository exerciseRepository,
    IPlannedWorkoutDeletedPublisher plannedWorkoutDeletedPublisher,
    Guid traineeId) : IAIPlannerToolDispatcher
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    private readonly WorkoutAnalysisToolDispatcher _workoutDispatcher =
        new(plannedWorkoutRepository, traineeId);

    public Task<string> GetRecentCompletedWorkoutsAsync(string beforeDate, int count, CancellationToken ct)
        => _workoutDispatcher.GetRecentCompletedWorkoutsAsync(beforeDate, count, ct);

    public Task<string> GetWorkoutsForExerciseAsync(string exerciseName, int count, string? beforeDate, string? afterDate, CancellationToken ct)
        => _workoutDispatcher.GetWorkoutsForExerciseAsync(exerciseName, count, beforeDate, afterDate, ct);

    public async Task<string> GetUpcomingWorkoutsAsync(string afterDate, int count, CancellationToken ct)
    {
        var workouts = await GetUpcomingWorkoutEntriesAsync(afterDate, count, ct);

        var entries = workouts.Select(w => new UpcomingWorkoutEntry
        {
            Id = w.Id,
            Date = w.PlannedAt.ToString("yyyy-MM-dd"),
            Name = w.Name,
            ExerciseCount = w.Exercises.Count,
            ExerciseNames = w.Exercises.Select(e => e.Name).ToList(),
        }).ToList();

        return JsonSerializer.Serialize(entries, JsonOptions);
    }

    public async Task<string> GetUpcomingWorkoutDetailsAsync(string afterDate, int count, CancellationToken ct)
    {
        var workouts = await GetUpcomingWorkoutEntriesAsync(afterDate, count, ct);

        var entries = workouts.Select(workout => new UpcomingWorkoutDetailsEntry
        {
            Id = workout.Id,
            PlannedAt = workout.PlannedAt.ToString("yyyy-MM-dd"),
            Name = workout.Name,
            Note = workout.Note,
            Exercises = workout.Exercises.Select(exercise => new UpcomingWorkoutExerciseEntry
            {
                Id = exercise.Id,
                ExerciseId = exercise.ExerciseId,
                Name = exercise.Name,
                Note = exercise.Note,
                Sets = exercise.Prescription?.Sets?.Select((set, index) => new UpcomingWorkoutSetEntry
                {
                    SetNumber = index + 1,
                    Reps = set.Target?.Reps,
                    WeightKg = set.Target?.WeightKg,
                    DurationSeconds = set.Target?.DurationSeconds,
                    DistanceMeters = set.Target?.DistanceMeters,
                    Note = set.Target?.Note,
                }).ToList() ?? [],
            }).ToList(),
        }).ToList();

        return JsonSerializer.Serialize(entries, JsonOptions);
    }

    public async Task<string> GetRecentWorkoutAnalysesAsync(int count, CancellationToken ct)
    {
        count = Math.Clamp(count, 1, 5);
        var analyses = await workoutMediaAnalysisRepository.GetRecentByTrainee(traineeId, count, ct);

        var entries = analyses.Select(a => new AnalysisSummary
        {
            Date = a.CreatedAt.ToString("yyyy-MM-dd"),
            Summary = a.Summary,
            KeyFindings = a.KeyFindings.ToList(),
            TechniqueRisks = a.TechniqueRisks.ToList(),
            CoachSuggestions = a.CoachSuggestions.ToList(),
        }).ToList();

        return JsonSerializer.Serialize(entries, JsonOptions);
    }

    public async Task<string> SearchExercisesAsync(string name, CancellationToken ct)
    {
        var results = await exerciseRepository.Search(name, [], [], null, ct);

        var entries = results.Take(10).Select(e => new ExerciseSummary
        {
            Id = e.Id,
            Name = e.Name,
            Type = e.Type.ToString(),
        }).ToList();

        return JsonSerializer.Serialize(entries, JsonOptions);
    }

    public Task<string> ConvertTimestampToWeekContextAsync(string timestamp, CancellationToken ct)
    {
        var parsed = DateTimeOffset.TryParse(timestamp, out var dateTimeOffset)
            ? dateTimeOffset
            : DateTimeOffset.UtcNow;

        var week = System.Globalization.ISOWeek.GetWeekOfYear(parsed.UtcDateTime);
        var isoYear = System.Globalization.ISOWeek.GetYear(parsed.UtcDateTime);

        return Task.FromResult(JsonSerializer.Serialize(new WeekContextEntry
        {
            Timestamp = parsed.ToString("O"),
            Date = DateOnly.FromDateTime(parsed.UtcDateTime).ToString("yyyy-MM-dd"),
            IsoWeek = week,
            IsoYear = isoYear,
            WeekLabel = $"W{week:00} {isoYear}",
        }, JsonOptions));
    }

    private async Task<List<PlannedWorkout>> GetUpcomingWorkoutEntriesAsync(string afterDate, int count, CancellationToken ct)
    {
        count = Math.Clamp(count, 1, 50);
        var fromDate = DateOnly.TryParse(afterDate, out var parsed) ? parsed : DateOnly.FromDateTime(DateTime.UtcNow);

        var cursor = new PlannedWorkoutCursor
        {
            TraineeId = traineeId,
            FromDate = fromDate,
            ToDate = fromDate.AddDays(count * 7),
            SortBy = ["plannedAt"],
            Order = SortOrder.Asc,
            DraftOnly = false,
            CompletedOnly = null,
            Size = count,
            Page = 0,
        };

        var result = await plannedWorkoutRepository.Get(cursor, ct);
        return result.Data.ToList();
    }

    private class UpcomingWorkoutEntry
    {
        public Guid Id { get; set; }

        public string Date { get; set; } = string.Empty;

        public string? Name { get; set; }

        public int ExerciseCount { get; set; }

        public List<string> ExerciseNames { get; set; } = [];
    }

    private class UpcomingWorkoutDetailsEntry
    {
        public Guid Id { get; set; }

        public string PlannedAt { get; set; } = string.Empty;

        public string? Name { get; set; }

        public string? Note { get; set; }

        public List<UpcomingWorkoutExerciseEntry> Exercises { get; set; } = [];
    }

    private class UpcomingWorkoutExerciseEntry
    {
        public Guid Id { get; set; }

        public Guid? ExerciseId { get; set; }

        public string? Name { get; set; }

        public string? Note { get; set; }

        public List<UpcomingWorkoutSetEntry> Sets { get; set; } = [];
    }

    private class UpcomingWorkoutSetEntry
    {
        public int SetNumber { get; set; }

        public int? Reps { get; set; }

        public double? WeightKg { get; set; }

        public int? DurationSeconds { get; set; }

        public double? DistanceMeters { get; set; }

        public string? Note { get; set; }
    }

    private class AnalysisSummary
    {
        public string Date { get; set; } = string.Empty;

        public string Summary { get; set; } = string.Empty;

        public List<string> KeyFindings { get; set; } = [];

        public List<string> TechniqueRisks { get; set; } = [];

        public List<string> CoachSuggestions { get; set; } = [];
    }

    private class ExerciseSummary
    {
        public Guid Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Type { get; set; } = string.Empty;
    }

    private class WeekContextEntry
    {
        public string Timestamp { get; set; } = string.Empty;

        public string Date { get; set; } = string.Empty;

        public int IsoWeek { get; set; }

        public int IsoYear { get; set; }

        public string WeekLabel { get; set; } = string.Empty;
    }
}
