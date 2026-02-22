using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IBlockRepository
{
    Task<Block> Create(Block block, CancellationToken cancellationToken);

    Task<Block?> Get(Guid blockId, CancellationToken cancellationToken);

    Task<ICollection<Block>> GetByCoach(Guid coachId, CancellationToken cancellationToken);

    Task Update(Block block, CancellationToken cancellationToken);

    Task Delete(Guid blockId, CancellationToken cancellationToken);
}
