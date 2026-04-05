namespace Mjolksyra.Domain.AI;

public interface IAIPlannerToolDispatcher : IWorkoutAnalysisToolDispatcher
{
    Task<string> GetUpcomingWorkoutsAsync(string afterDate, int count, CancellationToken ct);

    Task<string> GetRecentWorkoutAnalysesAsync(int count, CancellationToken ct);

    Task<string> SearchExercisesAsync(string name, CancellationToken ct);
}
