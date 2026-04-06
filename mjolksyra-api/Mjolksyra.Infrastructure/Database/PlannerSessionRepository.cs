using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class PlannerSessionRepository(IMongoDbContext context) : IPlannerSessionRepository
{
    public async Task<PlannerSession> Create(PlannerSession session, CancellationToken ct)
    {
        await context.PlannerSessions.InsertOneAsync(session, cancellationToken: ct);
        return session;
    }

    public async Task<PlannerSession?> GetById(Guid sessionId, CancellationToken ct)
    {
        return await context.PlannerSessions
            .Find(x => x.Id == sessionId)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<PlannerSession?> GetLatestByTrainee(Guid traineeId, Guid coachUserId, CancellationToken ct)
    {
        return await context.PlannerSessions
            .Find(x => x.TraineeId == traineeId && x.CoachUserId == coachUserId)
            .SortByDescending(x => x.UpdatedAt)
            .FirstOrDefaultAsync(ct);
    }

    public async Task Delete(Guid sessionId, CancellationToken ct)
    {
        await context.PlannerSessions.DeleteOneAsync(x => x.Id == sessionId, ct);
    }

    public async Task Update(PlannerSession session, CancellationToken ct)
    {
        await context.PlannerSessions.ReplaceOneAsync(
            x => x.Id == session.Id,
            session,
            cancellationToken: ct);
    }
}
