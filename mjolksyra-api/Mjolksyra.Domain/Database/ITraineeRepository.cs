using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface ITraineeRepository
{
    Task<Trainee> Create(Trainee trainee, CancellationToken ct);
    
    Task<ICollection<Trainee>> Get(Guid userId, CancellationToken ct);
}