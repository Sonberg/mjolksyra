using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IBlockPlannerSessionRepository
{
    Task<BlockPlannerSession> Create(BlockPlannerSession session, CancellationToken ct);

    Task<BlockPlannerSession?> GetById(Guid sessionId, CancellationToken ct);

    Task<BlockPlannerSession?> GetLatestByBlock(Guid blockId, Guid coachUserId, CancellationToken ct);

    Task<BlockPlannerSession?> GetByProposalId(Guid proposalId, Guid coachUserId, CancellationToken ct);

    Task Delete(Guid sessionId, CancellationToken ct);

    Task Update(BlockPlannerSession session, CancellationToken ct);
}
