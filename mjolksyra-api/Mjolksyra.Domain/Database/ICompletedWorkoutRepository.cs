using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface ICompletedWorkoutRepository
{
    Task<CompletedWorkout?> GetById(Guid id, CancellationToken cancellationToken);

    Task<CompletedWorkout?> GetByPlannedWorkoutId(Guid plannedWorkoutId, CancellationToken cancellationToken);

    Task<ICollection<CompletedWorkout>> GetByPlannedWorkoutIds(ICollection<Guid> plannedWorkoutIds, CancellationToken cancellationToken);

    Task<CompletedWorkout> Create(CompletedWorkout workout, CancellationToken cancellationToken);

    Task Update(CompletedWorkout workout, CancellationToken cancellationToken);

    Task<Paginated<CompletedWorkout>> Get(CompletedWorkoutCursor cursor, CancellationToken cancellationToken);
}
