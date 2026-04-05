using System.Text.Json;
using System.Text.Json.Serialization;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

namespace Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;

public class AIPlannerToolDispatcher(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IWorkoutMediaAnalysisRepository workoutMediaAnalysisRepository,
    IExerciseRepository exerciseRepository,
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

        var entries = result.Data.Select(w => new UpcomingWorkoutEntry
        {
            Date = w.PlannedAt.ToString("yyyy-MM-dd"),
            Name = w.Name,
            ExerciseCount = w.Exercises.Count,
            ExerciseNames = w.Exercises.Select(e => e.Name).ToList(),
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

    private class UpcomingWorkoutEntry
    {
        public string Date { get; set; } = string.Empty;

        public string? Name { get; set; }

        public int ExerciseCount { get; set; }

        public List<string> ExerciseNames { get; set; } = [];
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
}
