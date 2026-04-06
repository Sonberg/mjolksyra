using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IAIPlannerSessionRepository
{
    Task<AIPlannerSession> Create(AIPlannerSession session, CancellationToken ct);

    Task<AIPlannerSession?> GetById(Guid sessionId, CancellationToken ct);

    Task<AIPlannerSession?> GetLatestByTrainee(Guid traineeId, CancellationToken ct);

    Task Update(AIPlannerSession session, CancellationToken ct);
}
