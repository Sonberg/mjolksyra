using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
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
        var sort = new List<SortDefinition<PlannedWorkout>>();
        var filters = new List<FilterDefinition<PlannedWorkout>>
        {
            Builders<PlannedWorkout>.Filter.Eq(x => x.TraineeId, cursor.TraineeId)
        };

        if (cursor.FromDate is { } fromDate)
        {
            filters.Add(Builders<PlannedWorkout>.Filter.Gte(x => x.PlannedAt, fromDate));
        }

        if (cursor.ToDate is { } toDate)
        {
            filters.Add(Builders<PlannedWorkout>.Filter.Lte(x => x.PlannedAt, toDate));
        }

        if (cursor.SortBy is { } sortBy)
        {
            sort.AddRange(sortBy.Select(field => cursor.Order == SortOrder.Desc
                ? Builders<PlannedWorkout>.Sort.Descending(field)
                : Builders<PlannedWorkout>.Sort.Ascending(field)));
        }

        var response = await _context.PlannedWorkout
            .Find(Builders<PlannedWorkout>.Filter.And(filters))
            .Sort(Builders<PlannedWorkout>.Sort.Combine(sort))
            .Skip(cursor.Page * cursor.Size)
            .Limit(cursor.Size)
            .ToListAsync(cancellationToken);

        return new Paginated<PlannedWorkout>
        {
            Data = response,
            Cursor = Cursor.From(response, cursor)
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