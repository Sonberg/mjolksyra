namespace Mjolksyra.Domain.AI;

public interface IBlockPlannerToolDispatcher
{
    Task<string> GetBlockStructureAsync(CancellationToken ct);

    Task<string> SearchExercisesAsync(string name, CancellationToken ct);

    Task<string> GetTraineeInsightsAsync(Guid traineeId, CancellationToken ct);
}
