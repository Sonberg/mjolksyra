using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class PlannedWorkoutRepository : IPlannedWorkoutRepository
{
    private readonly IMongoDbContext _context;

    public PlannedWorkoutRepository(IMongoDbContext context)
    {
        _context = context;
    }

    public async Task<ICollection<PlannedWorkout>> Get(Guid traineeId, DateOnly fromDate, DateOnly toDate, CancellationToken cancellationToken)
    {
        var filters = Builders<PlannedWorkout>.Filter.And([
            Builders<PlannedWorkout>.Filter.Eq(x => x.TraineeId, traineeId),
            Builders<PlannedWorkout>.Filter.Gte(x => x.PlannedAt, fromDate),
            Builders<PlannedWorkout>.Filter.Lte(x => x.PlannedAt, toDate),
        ]);

        var cursor = await _context.PlannedWorkout.FindAsync(filters, cancellationToken: cancellationToken);
        var result = await cursor.ToListAsync(cancellationToken);

        return result;
    }

    public async Task<PlannedWorkout> Get(Guid plannedWorkoutId, CancellationToken cancellationToken)
    {
        return await _context.PlannedWorkout.Find(x => x.Id == plannedWorkoutId)
            .ToListAsync(cancellationToken)
            .ContinueWith(t => t.Result.Single(), cancellationToken);
    }

    public async Task Delete(Guid plannedWorkoutId, CancellationToken cancellationToken)
    {
        await _context.PlannedWorkout.FindOneAndDeleteAsync(x => x.Id == plannedWorkoutId, cancellationToken: cancellationToken);
    }

    public async Task<PlannedWorkout> Create(PlannedWorkout workout, CancellationToken cancellationToken)
    {
        await _context.PlannedWorkout.InsertOneAsync(workout, new InsertOneOptions(), cancellationToken);

        return workout;
    }

    public async Task Update(PlannedWorkout workout, CancellationToken cancellationToken)
    {
        await _context.PlannedWorkout.ReplaceOneAsync(x => x.Id == workout.Id, workout, new ReplaceOptions
        {
            IsUpsert = false
        }, cancellationToken);
    }
}