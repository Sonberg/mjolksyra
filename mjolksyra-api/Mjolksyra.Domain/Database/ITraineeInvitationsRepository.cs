using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface ITraineeInvitationsRepository
{
    Task<TraineeInvitation> Create(TraineeInvitation invitation, CancellationToken cancellationToken);

    Task<ICollection<TraineeInvitation>> GetAsync(string email, CancellationToken cancellationToken);

    Task<TraineeInvitation> GetByIdAsync(Guid coachUserId, CancellationToken cancellationToken);

    Task<ICollection<TraineeInvitation>> GetByCoachAsync(Guid coachUserId, CancellationToken cancellationToken);

    Task<int> CountPendingByCoachAndEmailAsync(Guid coachUserId, string email, CancellationToken cancellationToken);

    Task AcceptAsync(Guid id, CancellationToken cancellationToken);

    Task RejectAsync(Guid id, CancellationToken cancellationToken);
}
