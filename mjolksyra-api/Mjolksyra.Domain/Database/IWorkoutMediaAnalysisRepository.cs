using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IWorkoutMediaAnalysisRepository
{
    Task<WorkoutMediaAnalysisRecord> Create(WorkoutMediaAnalysisRecord analysis, CancellationToken ct);

    Task<WorkoutMediaAnalysisRecord?> GetLatest(Guid traineeId, Guid plannedWorkoutId, CancellationToken ct);
}
