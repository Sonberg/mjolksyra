using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IPlannerSessionRepository
{
    Task<PlannerSession> Create(PlannerSession session, CancellationToken ct);

    Task<PlannerSession?> GetById(Guid sessionId, CancellationToken ct);

    Task<PlannerSession?> GetLatestByTrainee(Guid traineeId, Guid coachUserId, CancellationToken ct);

    Task<PlannerSession?> GetByProposalId(Guid proposalId, Guid coachUserId, CancellationToken ct);

    Task Delete(Guid sessionId, CancellationToken ct);

    Task Update(PlannerSession session, CancellationToken ct);
}
