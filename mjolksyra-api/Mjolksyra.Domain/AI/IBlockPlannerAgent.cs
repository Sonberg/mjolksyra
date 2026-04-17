namespace Mjolksyra.Domain.AI;

public interface IBlockPlannerAgent
{
    Task<BlockPlannerClarifyOutput> ClarifyAsync(BlockPlannerClarifyInput input, CancellationToken cancellationToken = default);
}
