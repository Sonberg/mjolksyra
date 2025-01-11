using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
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

    public async Task<Paginated<PlannedWorkout>> Get(PlannedWorkoutCursor cursor, CancellationToken cancellationToken)
    {
        var filters = Builders<PlannedWorkout>.Filter.And([
            Builders<PlannedWorkout>.Filter.Eq(x => x.TraineeId, cursor.TraineeId),
            Builders<PlannedWorkout>.Filter.Gte(x => x.PlannedAt, cursor.FromDate),
            Builders<PlannedWorkout>.Filter.Lte(x => x.PlannedAt, cursor.ToDate),
        ]);

        var response = await _context.PlannedWorkout
            .Find(filters)
            .Skip(cursor.Page * cursor.Size)
            .Limit(cursor.Size)
            .ToListAsync(cancellationToken);

        return new Paginated<PlannedWorkout>
        {
            Data = response,
            Cursor = PlannedWorkoutCursor.From(response, cursor)
        };
    }

    public async Task<Paginated<PlannedWorkout>> Get(Guid traineeId, DateOnly? fromDate, DateOnly? toDate, int limit, CancellationToken cancellationToken)
    {
        var filters = Builders<PlannedWorkout>.Filter.And([
            Builders<PlannedWorkout>.Filter.Eq(x => x.TraineeId, traineeId),
            fromDate != null ? Builders<PlannedWorkout>.Filter.Gte(x => x.PlannedAt, fromDate) : Builders<PlannedWorkout>.Filter.Empty,
            toDate != null ? Builders<PlannedWorkout>.Filter.Lte(x => x.PlannedAt, toDate) : Builders<PlannedWorkout>.Filter.Empty,
        ]);

        var response = await _context.PlannedWorkout
            .Find(filters)
            .Limit(limit)
            .ToListAsync(cancellationToken);

        return new Paginated<PlannedWorkout>
        {
            Data = response,
            Cursor = Cursor.From(response, new PlannedWorkoutCursor
            {
                Page = 0,
                Size = limit,
                TraineeId = traineeId,
                FromDate = fromDate,
                ToDate = toDate
            })
        };
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