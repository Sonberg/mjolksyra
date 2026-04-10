using System.Text.Json;
using System.Text.Json.Serialization;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

public class WorkoutAnalysisToolDispatcher(
    ICompletedWorkoutRepository completedWorkoutRepository,
    Guid traineeId) : IWorkoutAnalysisToolDispatcher
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };

    public async Task<string> GetRecentCompletedWorkoutsAsync(string beforeDate, int count, CancellationToken ct)
    {
        count = Math.Clamp(count, 1, 10);
        var toDate = DateOnly.Parse(beforeDate).AddDays(-1);

        var cursor = new CompletedWorkoutCursor
        {
            TraineeId = traineeId,
            FromDate = null,
            ToDate = toDate,
            SortBy = ["plannedAt"],
            Order = SortOrder.Desc,
            CompletedOnly = true,
            Size = count,
            Page = 0,
        };

        var result = await completedWorkoutRepository.Get(cursor, ct);
        return JsonSerializer.Serialize(MapToProgressionEntries(result.Data), JsonOptions);
    }

    public async Task<string> GetWorkoutsForExerciseAsync(string exerciseName, int count, string? beforeDate, string? afterDate, CancellationToken ct)
    {
        count = Math.Clamp(count, 1, 10);

        var toDate = beforeDate is not null ? DateOnly.Parse(beforeDate) : (DateOnly?)null;
        var fromDate = afterDate is not null ? DateOnly.Parse(afterDate) : (DateOnly?)null;

        // For future/upcoming workouts (afterDate set), include incomplete sessions.
        // For past-only queries, restrict to completed.
        var completedOnly = fromDate is null ? true : (bool?)null;

        // Past workouts most recent first; upcoming workouts soonest first.
        var order = fromDate is not null ? SortOrder.Asc : SortOrder.Desc;

        var cursor = new CompletedWorkoutCursor
        {
            TraineeId = traineeId,
            FromDate = fromDate,
            ToDate = toDate,
            SortBy = ["plannedAt"],
            Order = order,
            CompletedOnly = completedOnly,
            Size = 20,
            Page = 0,
        };

        var result = await completedWorkoutRepository.Get(cursor, ct);

        var matching = result.Data
            .Where(w => w.Exercises.Any(e =>
                e.Name.Contains(exerciseName, StringComparison.OrdinalIgnoreCase)))
            .Take(count)
            .ToList();

        return JsonSerializer.Serialize(MapToProgressionEntries(matching), JsonOptions);
    }

    private static List<WorkoutProgressionEntry> MapToProgressionEntries(IEnumerable<CompletedWorkout> sessions)
    {
        return sessions.Select(s => new WorkoutProgressionEntry
        {
            Date = s.PlannedAt,
            Completed = s.CompletedAt.HasValue,
            Exercises = s.Exercises
                .Select(e => new WorkoutProgressionExercise
                {
                    Name = e.Name,
                    Sets = (e.Prescription?.Sets ?? [])
                        .Select((set, i) => new WorkoutProgressionSet
                        {
                            SetNumber = i + 1,
                            TargetReps = set.Target?.Reps,
                            TargetWeightKg = set.Target?.WeightKg,
                            ActualReps = set.Actual?.Reps,
                            ActualWeightKg = set.Actual?.WeightKg,
                            ActualIsDone = set.Actual?.IsDone,
                        })
                        .ToList(),
                })
                .ToList(),
        }).ToList();
    }

    private class WorkoutProgressionEntry
    {
        public DateOnly Date { get; set; }
        public bool Completed { get; set; }
        public List<WorkoutProgressionExercise> Exercises { get; set; } = [];
    }

    private class WorkoutProgressionExercise
    {
        public string Name { get; set; } = string.Empty;
        public List<WorkoutProgressionSet> Sets { get; set; } = [];
    }

    private class WorkoutProgressionSet
    {
        public int SetNumber { get; set; }
        public int? TargetReps { get; set; }
        public double? TargetWeightKg { get; set; }
        public int? ActualReps { get; set; }
        public double? ActualWeightKg { get; set; }
        public bool? ActualIsDone { get; set; }
    }
}
