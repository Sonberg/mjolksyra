namespace Mjolksyra.Domain.AI;

public interface ITraineePlannerAgent
{
    Task<AIPlannerClarifyOutput> ClarifyAsync(AIPlannerClarifyInput input, CancellationToken cancellationToken = default);

    Task<ICollection<AIPlannerWorkoutOutput>> GenerateAsync(AIPlannerGenerateInput input, CancellationToken cancellationToken = default);
}
