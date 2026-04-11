using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface ICompletedWorkoutChatMessageRepository
{
    Task<ICollection<CompletedWorkoutChatMessage>> GetByWorkoutId(Guid traineeId, Guid completedWorkoutId, CancellationToken cancellationToken);

    Task<CompletedWorkoutChatMessage> Create(CompletedWorkoutChatMessage message, CancellationToken cancellationToken);

    Task<CompletedWorkoutChatMessage?> GetById(Guid chatMessageId, CancellationToken cancellationToken);

    Task<CompletedWorkoutChatMessage?> UpdateMessage(
        Guid chatMessageId,
        string message,
        DateTimeOffset modifiedAt,
        CancellationToken cancellationToken);

    Task SetMediaCompressedUrl(
        Guid chatMessageId,
        string rawUrl,
        string compressedUrl,
        CancellationToken cancellationToken);
}
