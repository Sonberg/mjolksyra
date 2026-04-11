using System.Text.Json;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.CompletedWorkouts.AnalyzeCompletedWorkoutMedia;

public class LoggingWorkoutAnalysisToolDispatcher(IWorkoutAnalysisToolDispatcher inner) : IWorkoutAnalysisToolDispatcher
{
    private readonly List<WorkoutAnalysisToolCall> _calls = [];

    public IReadOnlyList<WorkoutAnalysisToolCall> Calls => _calls;

    public async Task<string> GetRecentCompletedWorkoutsAsync(string beforeDate, int count, CancellationToken ct)
    {
        var result = await inner.GetRecentCompletedWorkoutsAsync(beforeDate, count, ct);
        _calls.Add(new WorkoutAnalysisToolCall
        {
            Tool = "get_recent_completed_workouts",
            Arguments = JsonSerializer.Serialize(new { before_date = beforeDate, count }),
            Result = result,
            CalledAt = DateTimeOffset.UtcNow,
        });
        return result;
    }

    public async Task<string> GetWorkoutsForExerciseAsync(string exerciseName, int count, string? beforeDate, string? afterDate, CancellationToken ct)
    {
        var result = await inner.GetWorkoutsForExerciseAsync(exerciseName, count, beforeDate, afterDate, ct);
        _calls.Add(new WorkoutAnalysisToolCall
        {
            Tool = "get_workouts_for_exercise",
            Arguments = JsonSerializer.Serialize(new { exercise_name = exerciseName, count, before_date = beforeDate, after_date = afterDate }),
            Result = result,
            CalledAt = DateTimeOffset.UtcNow,
        });
        return result;
    }
}
