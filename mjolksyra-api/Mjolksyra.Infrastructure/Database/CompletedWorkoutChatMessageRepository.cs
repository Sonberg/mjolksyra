using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class CompletedWorkoutChatMessageRepository(IMongoDbContext context) : ICompletedWorkoutChatMessageRepository
{
    public async Task<ICollection<CompletedWorkoutChatMessage>> GetByWorkoutId(Guid traineeId, Guid completedWorkoutId, CancellationToken cancellationToken)
    {
        var filter = Builders<CompletedWorkoutChatMessage>.Filter.And(
            Builders<CompletedWorkoutChatMessage>.Filter.Eq(x => x.TraineeId, traineeId),
            Builders<CompletedWorkoutChatMessage>.Filter.Eq(x => x.CompletedWorkoutId, completedWorkoutId));

        return await context.CompletedWorkoutChatMessages
            .Find(filter)
            .SortBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<CompletedWorkoutChatMessage> Create(CompletedWorkoutChatMessage message, CancellationToken cancellationToken)
    {
        await context.CompletedWorkoutChatMessages.InsertOneAsync(message, new InsertOneOptions(), cancellationToken);
        return message;
    }

    public async Task<CompletedWorkoutChatMessage?> GetById(Guid chatMessageId, CancellationToken cancellationToken)
    {
        return await context.CompletedWorkoutChatMessages
            .Find(x => x.Id == chatMessageId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<CompletedWorkoutChatMessage?> UpdateMessage(
        Guid chatMessageId,
        string message,
        DateTimeOffset modifiedAt,
        CancellationToken cancellationToken)
    {
        var filter = Builders<CompletedWorkoutChatMessage>.Filter.Eq(x => x.Id, chatMessageId);
        var update = Builders<CompletedWorkoutChatMessage>.Update
            .Set(x => x.Message, message)
            .Set(x => x.ModifiedAt, modifiedAt);

        return await context.CompletedWorkoutChatMessages.FindOneAndUpdateAsync(
            filter,
            update,
            new FindOneAndUpdateOptions<CompletedWorkoutChatMessage>
            {
                ReturnDocument = ReturnDocument.After,
            },
            cancellationToken);
    }

    public async Task SetMediaCompressedUrl(
        Guid chatMessageId,
        string rawUrl,
        string compressedUrl,
        CancellationToken cancellationToken)
    {
        var filter = Builders<CompletedWorkoutChatMessage>.Filter.And(
            Builders<CompletedWorkoutChatMessage>.Filter.Eq(x => x.Id, chatMessageId),
            Builders<CompletedWorkoutChatMessage>.Filter.ElemMatch(x => x.Media, m => m.RawUrl == rawUrl));

        var update = Builders<CompletedWorkoutChatMessage>.Update
            .Set("Media.$.CompressedUrl", compressedUrl);

        await context.CompletedWorkoutChatMessages.UpdateOneAsync(filter, update, cancellationToken: cancellationToken);
    }
}
