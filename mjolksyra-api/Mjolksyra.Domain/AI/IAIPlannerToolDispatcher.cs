namespace Mjolksyra.Domain.AI;

public interface IAIPlannerToolDispatcher : IWorkoutAnalysisToolDispatcher
{
    Task<string> GetUpcomingWorkoutsAsync(string afterDate, int count, CancellationToken ct);

    Task<string> GetUpcomingWorkoutDetailsAsync(string afterDate, int count, CancellationToken ct);

    Task<string> GetRecentWorkoutAnalysesAsync(int count, CancellationToken ct);

    Task<string> SearchExercisesAsync(string name, CancellationToken ct);

    Task<string> ConvertTimestampToWeekContextAsync(string timestamp, CancellationToken ct);

    Task<string> GetTraineeInsightsAsync(CancellationToken ct);

    Task<string> GetCoachInsightsAsync(CancellationToken ct);
}
