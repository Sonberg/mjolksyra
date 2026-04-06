using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class AIPlannerSessionRepository(IMongoDbContext context) : IAIPlannerSessionRepository
{
    public async Task<AIPlannerSession> Create(AIPlannerSession session, CancellationToken ct)
    {
        await context.AIPlannerSessions.InsertOneAsync(session, cancellationToken: ct);
        return session;
    }

    public async Task<AIPlannerSession?> GetById(Guid sessionId, CancellationToken ct)
    {
        return await context.AIPlannerSessions
            .Find(x => x.Id == sessionId)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<AIPlannerSession?> GetLatestByTrainee(Guid traineeId, Guid coachUserId, CancellationToken ct)
    {
        return await context.AIPlannerSessions
            .Find(x => x.TraineeId == traineeId && x.CoachUserId == coachUserId)
            .SortByDescending(x => x.UpdatedAt)
            .FirstOrDefaultAsync(ct);
    }

    public async Task Delete(Guid sessionId, CancellationToken ct)
    {
        await context.AIPlannerSessions.DeleteOneAsync(x => x.Id == sessionId, ct);
    }

    public async Task Update(AIPlannerSession session, CancellationToken ct)
    {
        await context.AIPlannerSessions.ReplaceOneAsync(
            x => x.Id == session.Id,
            session,
            cancellationToken: ct);
    }
}
