using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class PlannedWorkoutChatMessageRepository(IMongoDbContext context) : IPlannedWorkoutChatMessageRepository
{
    public async Task<ICollection<PlannedWorkoutChatMessage>> GetByWorkoutId(Guid traineeId, Guid plannedWorkoutId, CancellationToken cancellationToken)
    {
        var filter = Builders<PlannedWorkoutChatMessage>.Filter.And(
            Builders<PlannedWorkoutChatMessage>.Filter.Eq(x => x.TraineeId, traineeId),
            Builders<PlannedWorkoutChatMessage>.Filter.Eq(x => x.PlannedWorkoutId, plannedWorkoutId));

        return await context.PlannedWorkoutChatMessages
            .Find(filter)
            .SortBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<PlannedWorkoutChatMessage> Create(PlannedWorkoutChatMessage message, CancellationToken cancellationToken)
    {
        await context.PlannedWorkoutChatMessages.InsertOneAsync(message, new InsertOneOptions(), cancellationToken);
        return message;
    }

    public async Task<PlannedWorkoutChatMessage?> GetById(Guid chatMessageId, CancellationToken cancellationToken)
    {
        return await context.PlannedWorkoutChatMessages
            .Find(x => x.Id == chatMessageId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PlannedWorkoutChatMessage?> UpdateMessage(
        Guid chatMessageId,
        string message,
        DateTimeOffset modifiedAt,
        CancellationToken cancellationToken)
    {
        var filter = Builders<PlannedWorkoutChatMessage>.Filter.Eq(x => x.Id, chatMessageId);
        var update = Builders<PlannedWorkoutChatMessage>.Update
            .Set(x => x.Message, message)
            .Set(x => x.ModifiedAt, modifiedAt);

        return await context.PlannedWorkoutChatMessages.FindOneAndUpdateAsync(
            filter,
            update,
            new FindOneAndUpdateOptions<PlannedWorkoutChatMessage>
            {
                ReturnDocument = ReturnDocument.After,
            },
            cancellationToken);
    }
}
