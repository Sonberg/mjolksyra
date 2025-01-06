using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IExerciseRepository
{
    Task<Exercise> Create(Exercise exercise, CancellationToken cancellationToken = default);

    Task<ICollection<Exercise>> Search(string freeText, CancellationToken cancellationToken = default);

    Task<Paginated<Exercise>> Get(int limit, CancellationToken cancellationToken = default);

    Task<Paginated<Exercise>> Get(Cursor cursor, CancellationToken cancellationToken = default);

    Task<Paginated<Exercise>> Starred(Guid userId, CancellationToken cancellationToken = default);

    Task<bool> Star(Guid exerciseId, Guid userId, CancellationToken cancellationToken = default);

    Task<bool> Unstar(Guid exerciseId, Guid userId, CancellationToken cancellationToken = default);
}