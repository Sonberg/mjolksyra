using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class BlockPlannerSessionRepository(IMongoDbContext context) : IBlockPlannerSessionRepository
{
    public async Task<BlockPlannerSession> Create(BlockPlannerSession session, CancellationToken ct)
    {
        await context.BlockPlannerSessions.InsertOneAsync(session, cancellationToken: ct);
        return session;
    }

    public async Task<BlockPlannerSession?> GetById(Guid sessionId, CancellationToken ct)
    {
        return await context.BlockPlannerSessions
            .Find(x => x.Id == sessionId)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<BlockPlannerSession?> GetLatestByBlock(Guid blockId, Guid coachUserId, CancellationToken ct)
    {
        return await context.BlockPlannerSessions
            .Find(x => x.BlockId == blockId && x.CoachUserId == coachUserId)
            .SortByDescending(x => x.UpdatedAt)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<BlockPlannerSession?> GetByProposalId(Guid proposalId, Guid coachUserId, CancellationToken ct)
    {
        return await context.BlockPlannerSessions
            .Find(x =>
                x.CoachUserId == coachUserId &&
                x.ProposedActionSet != null &&
                x.ProposedActionSet.Id == proposalId)
            .FirstOrDefaultAsync(ct);
    }

    public async Task Delete(Guid sessionId, CancellationToken ct)
    {
        await context.BlockPlannerSessions.DeleteOneAsync(x => x.Id == sessionId, ct);
    }

    public async Task Update(BlockPlannerSession session, CancellationToken ct)
    {
        await context.BlockPlannerSessions.ReplaceOneAsync(
            x => x.Id == session.Id,
            session,
            cancellationToken: ct);
    }
}
