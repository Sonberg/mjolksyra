using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IWorkoutMediaAnalysisRepository
{
    Task<WorkoutMediaAnalysisRecord> Create(WorkoutMediaAnalysisRecord analysis, CancellationToken ct);
}
