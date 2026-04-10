using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class CompletedWorkoutRepository : ICompletedWorkoutRepository
{
    private readonly IMongoDbContext _context;

    public CompletedWorkoutRepository(IMongoDbContext context)
    {
        _context = context;
    }

    public async Task<CompletedWorkout?> GetById(Guid id, CancellationToken cancellationToken)
    {
        return await _context.CompletedWorkouts
            .Find(x => x.Id == id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<CompletedWorkout?> GetByPlannedWorkoutId(Guid plannedWorkoutId, CancellationToken cancellationToken)
    {
        var result = await _context.CompletedWorkouts
            .Find(x => x.PlannedWorkoutId == plannedWorkoutId)
            .FirstOrDefaultAsync(cancellationToken);

        return result;
    }

    public async Task<ICollection<CompletedWorkout>> GetByPlannedWorkoutIds(ICollection<Guid> plannedWorkoutIds, CancellationToken cancellationToken)
    {
        return await _context.CompletedWorkouts
            .Find(Builders<CompletedWorkout>.Filter.In(x => x.PlannedWorkoutId, plannedWorkoutIds))
            .ToListAsync(cancellationToken);
    }

    public async Task<CompletedWorkout> Create(CompletedWorkout workout, CancellationToken cancellationToken)
    {
        await _context.CompletedWorkouts.InsertOneAsync(workout, new InsertOneOptions(), cancellationToken);
        return workout;
    }

    public async Task Update(CompletedWorkout workout, CancellationToken cancellationToken)
    {
        await _context.CompletedWorkouts.ReplaceOneAsync(
            x => x.Id == workout.Id,
            workout,
            new ReplaceOptions { IsUpsert = false },
            cancellationToken);
    }

    public async Task<Paginated<CompletedWorkout>> Get(CompletedWorkoutCursor cursor, CancellationToken cancellationToken)
    {
        var sort = new List<SortDefinition<CompletedWorkout>>();
        var filters = new List<FilterDefinition<CompletedWorkout>>
        {
            Builders<CompletedWorkout>.Filter.Eq(x => x.TraineeId, cursor.TraineeId)
        };

        if (cursor.FromDate is { } fromDate)
        {
            filters.Add(Builders<CompletedWorkout>.Filter.Gte(x => x.PlannedAt, fromDate));
        }

        if (cursor.ToDate is { } toDate)
        {
            filters.Add(Builders<CompletedWorkout>.Filter.Lte(x => x.PlannedAt, toDate));
        }

        if (cursor.CompletedOnly == true)
        {
            filters.Add(Builders<CompletedWorkout>.Filter.Ne(x => x.CompletedAt, null));
        }

        if (cursor.SortBy is { } sortBy)
        {
            sort.AddRange(sortBy.Select(field => cursor.Order == SortOrder.Desc
                ? Builders<CompletedWorkout>.Sort.Descending(field)
                : Builders<CompletedWorkout>.Sort.Ascending(field)));
        }

        if (sort.Count == 0)
        {
            sort.Add(Builders<CompletedWorkout>.Sort.Ascending(x => x.PlannedAt));
        }

        var response = await _context.CompletedWorkouts
            .Find(Builders<CompletedWorkout>.Filter.And(filters))
            .Sort(Builders<CompletedWorkout>.Sort.Combine(sort))
            .Skip(cursor.Page * cursor.Size)
            .Limit(cursor.Size)
            .ToListAsync(cancellationToken);

        return new Paginated<CompletedWorkout>
        {
            Data = response,
            Cursor = Cursor.From(response, cursor)
        };
    }
}
