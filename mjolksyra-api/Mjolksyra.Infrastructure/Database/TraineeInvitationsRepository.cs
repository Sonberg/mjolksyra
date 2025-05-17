using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class TraineeInvitationsRepository : ITraineeInvitationsRepository
{
    private readonly IMongoDbContext _dbContext;

    public TraineeInvitationsRepository(IMongoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<TraineeInvitation> Create(TraineeInvitation invitation, CancellationToken cancellationToken)
    {
        await _dbContext.TraineeInvitations.InsertOneAsync(invitation, cancellationToken: cancellationToken);

        return invitation;
    }

    public async Task<ICollection<TraineeInvitation>> GetAsync(string email, CancellationToken cancellationToken)
    {
        return await _dbContext.TraineeInvitations.Find(
                Builders<TraineeInvitation>.Filter.And(
                    Builders<TraineeInvitation>.Filter.Eq(x => x.Email, email),
                    Builders<TraineeInvitation>.Filter.Eq(x => x.AcceptedAt, null),
                    Builders<TraineeInvitation>.Filter.Eq(x => x.RejectedAt, null)
                )
            )
            .ToListAsync(cancellationToken);
    }

    public async Task<TraineeInvitation> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _dbContext.TraineeInvitations.Find(
                Builders<TraineeInvitation>.Filter.And(
                    Builders<TraineeInvitation>.Filter.Eq(x => x.Id, id)
                )
            )
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<ICollection<TraineeInvitation>> GetByCoachAsync(Guid coachUserId, CancellationToken cancellationToken)
    {
        return await _dbContext.TraineeInvitations.Find(
                Builders<TraineeInvitation>.Filter.And(
                    Builders<TraineeInvitation>.Filter.Eq(x => x.CoachUserId, coachUserId),
                    Builders<TraineeInvitation>.Filter.Eq(x => x.AcceptedAt, null),
                    Builders<TraineeInvitation>.Filter.Eq(x => x.RejectedAt, null)
                )
            )
            .ToListAsync(cancellationToken);
    }

    public async Task AcceptAsync(Guid id, CancellationToken cancellationToken)
    {
        await _dbContext.TraineeInvitations.FindOneAndUpdateAsync(
            Builders<TraineeInvitation>.Filter.Eq(x => x.Id, id),
            Builders<TraineeInvitation>.Update.Set(x => x.AcceptedAt, DateTimeOffset.Now),
            cancellationToken: cancellationToken);
    }

    public async Task RejectAsync(Guid id, CancellationToken cancellationToken)
    {
        await _dbContext.TraineeInvitations.FindOneAndUpdateAsync(
            Builders<TraineeInvitation>.Filter.Eq(x => x.Id, id),
            Builders<TraineeInvitation>.Update.Set(x => x.RejectedAt, DateTimeOffset.Now),
            cancellationToken: cancellationToken);
    }
}