using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Infrastructure.Database;

public class TraineeInvitationsRepository : ITraineeInvitationsRepository
{
    public Task<TraineeInvitation> Create(TraineeInvitation invitation, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<ICollection<TraineeInvitation>> GetAsync(string email, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task AcceptAsync(Guid id, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task RejectAsync(Guid id, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}