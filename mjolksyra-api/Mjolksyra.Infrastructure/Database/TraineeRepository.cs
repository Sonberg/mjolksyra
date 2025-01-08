using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class TraineeRepository : ITraineeRepository
{
    private readonly IMongoDbContext _context;

    public TraineeRepository(IMongoDbContext context)
    {
        _context = context;
    }

    public async Task<Trainee> Create(Trainee trainee, CancellationToken ct)
    {
        await _context.Trainees.InsertOneAsync(trainee, new InsertOneOptions(), ct);

        return trainee;
    }

    public async Task<ICollection<Trainee>> Get(Guid userId, CancellationToken ct)
    {
        var filters = Builders<Trainee>.Filter.Or([
            Builders<Trainee>.Filter.Eq(x => x.AthleteUserId, userId),
            Builders<Trainee>.Filter.Eq(x => x.CoachUserId, userId)
        ]);
        
        return await _context.Trainees
            .Find(filters)
            .ToListAsync(ct);
    }
}