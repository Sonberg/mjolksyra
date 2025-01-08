using System.Linq.Expressions;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class ExerciseRepository : IExerciseRepository
{
    private readonly IMongoDbContext _mongoDbContext;

    public ExerciseRepository(IMongoDbContext mongoDbContext)
    {
        _mongoDbContext = mongoDbContext;
    }

    public async Task<Exercise> Create(Exercise exercise, CancellationToken cancellationToken = default)
    {
        await _mongoDbContext.Exercises.InsertOneAsync(exercise, new InsertOneOptions(), cancellationToken);

        return exercise;
    }

    public async Task Delete(Guid id, CancellationToken cancellationToken = default)
    {
        await _mongoDbContext.Exercises.DeleteOneAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<Exercise> Get(Guid id, CancellationToken cancellationToken = default)
    {
        return await _mongoDbContext.Exercises
            .FindAsync(x => x.Id == id, new FindOptions<Exercise>(), cancellationToken)
            .ContinueWith(t => t.Result.ToListAsync(cancellationToken: cancellationToken), cancellationToken)
            .ContinueWith(t => t.Result.Result.Single(), cancellationToken);
    }

    public async Task<ICollection<Exercise>> Search(string freeText, CancellationToken cancellationToken = default)
    {
        var projection = Builders<Exercise>.Projection.MetaTextScore("Score");
        var filter = Builders<Exercise>.Filter.And([
            Builders<Exercise>.Filter.Eq(x => x.DeletedAt, null),
            Builders<Exercise>.Filter.Text(freeText, new TextSearchOptions
            {
                CaseSensitive = false,
                DiacriticSensitive = false
            })
        ]);

        var result = await _mongoDbContext.Exercises
            .Find(filter)
            .Project<Exercise>(projection)
            .SortByDescending(x => x.Score)
            .ThenBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return result;
    }

    public async Task<Paginated<Exercise>> Get(int limit, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Exercise>.Filter.And([
            Builders<Exercise>.Filter.Eq(x => x.DeletedAt, null)
        ]);

        var response = await _mongoDbContext.Exercises
            .Find(filter)
            .SortBy(x => x.Name)
            .Limit(limit)
            .ToListAsync(cancellationToken);

        return new Paginated<Exercise>
        {
            Data = response,
            Cursor = Cursor.From(response, new Cursor
            {
                Page = 0,
                Size = limit
            })
        };
    }

    public async Task<Paginated<Exercise>> Get(Cursor cursor, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Exercise>.Filter.And([
            Builders<Exercise>.Filter.Eq(x => x.DeletedAt, null)
        ]);

        var response = await _mongoDbContext.Exercises
            .Find(filter)
            .SortBy(x => x.Name)
            .Skip(cursor.Page * cursor.Size)
            .Limit(cursor.Size)
            .ToListAsync(cancellationToken);

        return new Paginated<Exercise>
        {
            Data = response,
            Cursor = Cursor.From(response, cursor)
        };
    }

    public async Task<Paginated<Exercise>> Starred(Guid userId, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Exercise>.Filter.And([
            Builders<Exercise>.Filter.AnyIn(x => x.StarredBy, [userId]),
            Builders<Exercise>.Filter.Eq(x => x.DeletedAt, null)
        ]);

        var result = await _mongoDbContext.Exercises
            .Find(filter)
            .SortBy(x => x.Name)
            .ToListAsync(cancellationToken);

        return new Paginated<Exercise>
        {
            Data = result,
            Cursor = null
        };
    }


    public async Task<bool> Star(Guid exerciseId, Guid userId, CancellationToken cancellationToken = default)
    {
        var update = Builders<Exercise>.Update.AddToSet(x => x.StarredBy, userId);
        var result = await _mongoDbContext.Exercises
            .UpdateOneAsync(x => x.Id == exerciseId, update, new UpdateOptions
            {
                IsUpsert = true
            }, cancellationToken);

        return result.IsAcknowledged;
    }

    public async Task<bool> Unstar(Guid exerciseId, Guid userId, CancellationToken cancellationToken = default)
    {
        var update = Builders<Exercise>.Update.Pull(x => x.StarredBy, userId);
        var result = await _mongoDbContext.Exercises
            .UpdateOneAsync(x => x.Id == exerciseId, update, new UpdateOptions
            {
                IsUpsert = true
            }, cancellationToken);

        return result.IsAcknowledged;
    }

    public async Task<ExerciseOptions> Options(CancellationToken cancellationToken = default)
    {
        var categoryTask = DistinctAsync(x => x.Category, cancellationToken);
        var equipmentTask = DistinctAsync(x => x.Equipment, cancellationToken);
        var forceTask = DistinctAsync(x => x.Force, cancellationToken);
        var levelTask = DistinctAsync(x => x.Level, cancellationToken);
        var mechanicTask = DistinctAsync(x => x.Mechanic, cancellationToken);

        await Task.WhenAll(categoryTask, equipmentTask, forceTask, levelTask, mechanicTask);

        return new ExerciseOptions
        {
            Category = categoryTask.Result,
            Equipment = equipmentTask.Result,
            Force = forceTask.Result,
            Level = levelTask.Result,
            Mechanic = mechanicTask.Result
        };
    }


    private Task<List<string>> DistinctAsync(Expression<Func<Exercise, string?>> selector, CancellationToken cancellationToken)
    {
        return _mongoDbContext.Exercises
            .DistinctAsync(
                selector,
                Builders<Exercise>.Filter.Ne(selector, null),
                cancellationToken: cancellationToken)
            .ContinueWith(t => t.Result.ToListAsync(cancellationToken: cancellationToken), cancellationToken)
            .ContinueWith(t => t.Result.Result.OfType<string>().ToList(), cancellationToken);
    }
}