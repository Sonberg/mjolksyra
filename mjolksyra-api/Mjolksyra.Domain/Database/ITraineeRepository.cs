using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface ITraineeRepository
{
    Task<Trainee> Create(Trainee trainee, CancellationToken ct);
    
    Task<Trainee> Update(Trainee trainee, CancellationToken ct);

    Task<Trainee?> GetById(Guid traineeId, CancellationToken ct);

    Task<ICollection<Trainee>> Get(Guid userId, CancellationToken ct);

    Task<bool> HasAccess(Guid traineeId, Guid userId, CancellationToken cancellationToken);

    Task<Trainee?> GetBySubscriptionId(string subscriptionId, CancellationToken ct);

    Task<int> CountActiveByCoachId(Guid coachUserId, CancellationToken ct);

    Task<bool> ExistsActiveRelationship(Guid coachUserId, Guid athleteUserId, CancellationToken ct);
}
