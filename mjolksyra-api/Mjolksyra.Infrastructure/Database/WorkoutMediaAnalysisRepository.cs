using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Infrastructure.Database;

public class WorkoutMediaAnalysisRepository(IMongoDbContext context) : IWorkoutMediaAnalysisRepository
{
    public async Task<WorkoutMediaAnalysisRecord> Create(WorkoutMediaAnalysisRecord analysis, CancellationToken ct)
    {
        await context.WorkoutMediaAnalyses.InsertOneAsync(analysis, cancellationToken: ct);
        return analysis;
    }
}
