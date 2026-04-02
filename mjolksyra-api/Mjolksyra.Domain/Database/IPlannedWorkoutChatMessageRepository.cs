using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IPlannedWorkoutChatMessageRepository
{
    Task<ICollection<PlannedWorkoutChatMessage>> GetByWorkoutId(Guid traineeId, Guid plannedWorkoutId, CancellationToken cancellationToken);

    Task<PlannedWorkoutChatMessage> Create(PlannedWorkoutChatMessage message, CancellationToken cancellationToken);

    Task<PlannedWorkoutChatMessage?> GetById(Guid chatMessageId, CancellationToken cancellationToken);

    Task<PlannedWorkoutChatMessage?> UpdateMessage(
        Guid chatMessageId,
        string message,
        DateTimeOffset modifiedAt,
        CancellationToken cancellationToken);
}
