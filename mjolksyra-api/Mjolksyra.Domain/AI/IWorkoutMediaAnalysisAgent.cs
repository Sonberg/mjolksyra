namespace Mjolksyra.Domain.AI;

public interface IWorkoutMediaAnalysisAgent
{
    Task<WorkoutMediaAnalysis> AnalyzeAsync(WorkoutMediaAnalysisInput input, CancellationToken cancellationToken = default);
}
