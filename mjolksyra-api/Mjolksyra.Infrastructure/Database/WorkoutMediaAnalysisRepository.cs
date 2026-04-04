using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class WorkoutMediaAnalysisRepository(IMongoDbContext context) : IWorkoutMediaAnalysisRepository
{
    public async Task<WorkoutMediaAnalysisRecord> Create(WorkoutMediaAnalysisRecord analysis, CancellationToken ct)
    {
        await context.WorkoutMediaAnalyses.InsertOneAsync(analysis, cancellationToken: ct);
        return analysis;
    }

    public async Task<WorkoutMediaAnalysisRecord?> GetLatest(Guid traineeId, Guid plannedWorkoutId, CancellationToken ct)
    {
        return await context.WorkoutMediaAnalyses
            .Find(x => x.TraineeId == traineeId && x.PlannedWorkoutId == plannedWorkoutId)
            .SortByDescending(x => x.CreatedAt)
            .FirstOrDefaultAsync(ct);
    }
}
