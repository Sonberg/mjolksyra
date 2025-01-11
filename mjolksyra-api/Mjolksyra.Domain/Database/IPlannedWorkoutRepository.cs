using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IPlannedWorkoutRepository
{
    Task<Paginated<PlannedWorkout>> Get(PlannedWorkoutCursor cursor, CancellationToken cancellationToken);

    Task<Paginated<PlannedWorkout>> Get(
        Guid traineeId,
        DateOnly? fromDate,
        DateOnly? toDate,
        int limit,
        CancellationToken cancellationToken);

    Task<PlannedWorkout> Get(Guid plannedWorkoutId, CancellationToken cancellationToken);

    Task Delete(Guid plannedWorkoutId, CancellationToken cancellationToken);

    Task<PlannedWorkout> Create(PlannedWorkout workout, CancellationToken cancellationToken);

    Task Update(PlannedWorkout workout, CancellationToken cancellationToken);
}