using System.Text.Json;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;

public class LoggingTraineePlannerToolDispatcher(ITraineePlannerToolDispatcher inner) : ITraineePlannerToolDispatcher
{
    private readonly List<WorkoutAnalysisToolCall> _calls = [];

    public IReadOnlyList<WorkoutAnalysisToolCall> Calls => _calls;

    public async Task<string> GetRecentCompletedWorkoutsAsync(string beforeDate, int count, CancellationToken ct)
    {
        var result = await inner.GetRecentCompletedWorkoutsAsync(beforeDate, count, ct);
        Log("get_recent_completed_workouts", new { before_date = beforeDate, count }, result);
        return result;
    }

    public async Task<string> GetWorkoutsForExerciseAsync(string exerciseName, int count, string? beforeDate, string? afterDate, CancellationToken ct)
    {
        var result = await inner.GetWorkoutsForExerciseAsync(exerciseName, count, beforeDate, afterDate, ct);
        Log("get_workouts_for_exercise", new { exercise_name = exerciseName, count, before_date = beforeDate, after_date = afterDate }, result);
        return result;
    }

    public async Task<string> GetUpcomingWorkoutsAsync(string afterDate, int count, CancellationToken ct)
    {
        var result = await inner.GetUpcomingWorkoutsAsync(afterDate, count, ct);
        Log("get_upcoming_workouts", new { after_date = afterDate, count }, result);
        return result;
    }

    public async Task<string> GetUpcomingWorkoutDetailsAsync(string afterDate, int count, CancellationToken ct)
    {
        var result = await inner.GetUpcomingWorkoutDetailsAsync(afterDate, count, ct);
        Log("get_upcoming_workout_details", new { after_date = afterDate, count }, result);
        return result;
    }

    public async Task<string> GetRecentWorkoutAnalysesAsync(int count, CancellationToken ct)
    {
        var result = await inner.GetRecentWorkoutAnalysesAsync(count, ct);
        Log("get_recent_workout_analyses", new { count }, result);
        return result;
    }

    public async Task<string> SearchExercisesAsync(string name, CancellationToken ct)
    {
        var result = await inner.SearchExercisesAsync(name, ct);
        Log("search_exercises", new { name }, result);
        return result;
    }

    public async Task<string> ConvertTimestampToWeekContextAsync(string timestamp, CancellationToken ct)
    {
        var result = await inner.ConvertTimestampToWeekContextAsync(timestamp, ct);
        Log("convert_timestamp_to_week_context", new { timestamp }, result);
        return result;
    }

    public async Task<string> GetTraineeInsightsAsync(CancellationToken ct)
    {
        var result = await inner.GetTraineeInsightsAsync(ct);
        Log("get_trainee_insights", new { }, result);
        return result;
    }

    public async Task<string> GetCoachInsightsAsync(CancellationToken ct)
    {
        var result = await inner.GetCoachInsightsAsync(ct);
        Log("get_coach_insights", new { }, result);
        return result;
    }

    private void Log(string tool, object arguments, string result)
    {
        _calls.Add(new WorkoutAnalysisToolCall
        {
            Tool = tool,
            Arguments = JsonSerializer.Serialize(arguments),
            Result = result,
            CalledAt = DateTimeOffset.UtcNow,
        });
    }
}
