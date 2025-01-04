using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IExerciseRepository
{
    Task<ICollection<Exercise>> SearchAsync(string freeText, CancellationToken cancellationToken = default);

    Task<ICollection<Exercise>> GetAsync(CancellationToken cancellationToken = default);

    Task<ICollection<Exercise>> GetLikedAsync(Guid userId, CancellationToken cancellationToken = default);

    Task<Exercise> LikeAsync(Guid exerciseId, Guid userId, CancellationToken cancellationToken = default);

    Task<Exercise> UnlikeAsync(Guid exerciseId, Guid userId, CancellationToken cancellationToken = default);
}