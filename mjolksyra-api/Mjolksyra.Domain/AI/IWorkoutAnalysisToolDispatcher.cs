namespace Mjolksyra.Domain.AI;

public interface IWorkoutAnalysisToolDispatcher
{
    Task<string> GetRecentCompletedWorkoutsAsync(string beforeDate, int count, CancellationToken ct);

    Task<string> GetWorkoutsForExerciseAsync(string exerciseName, int count, string? beforeDate, string? afterDate, CancellationToken ct);
}
