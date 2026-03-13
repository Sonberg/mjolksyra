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

    public async Task<ICollection<Exercise>> GetMany(ICollection<Guid> ids, CancellationToken cancellationToken = default)
    {
        return await _mongoDbContext.Exercises
            .Find(x => ids.Contains(x.Id))
            .ToListAsync(cancellationToken);
    }

    public async Task<ICollection<Exercise>> Search(
        string? freeText,
        ICollection<ExerciseSport> sports,
        ICollection<ExerciseLevel> levels,
        Guid? createdBy,
        CancellationToken cancellationToken = default)
    {
        var baseFilters = new List<FilterDefinition<Exercise>>
        {
            Builders<Exercise>.Filter.Eq(x => x.DeletedAt, null)
        };

        if (sports.Count > 0)
        {
            baseFilters.Add(Builders<Exercise>.Filter.AnyIn(x => x.Sports, sports));
        }

        if (levels.Count > 0)
        {
            baseFilters.Add(Builders<Exercise>.Filter.Or(levels.Select(l => Builders<Exercise>.Filter.Eq(x => x.Level, l))));
        }

        if (createdBy.HasValue)
        {
            baseFilters.Add(Builders<Exercise>.Filter.Eq(x => x.CreatedBy, createdBy.Value));
        }

        if (!string.IsNullOrWhiteSpace(freeText))
        {
            var tokens = freeText.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            foreach (var token in tokens)
            {
                baseFilters.Add(Builders<Exercise>.Filter.Regex(
                    x => x.Name,
                    new MongoDB.Bson.BsonRegularExpression(token, "i")));
            }
        }

        var result = await _mongoDbContext.Exercises
            .Find(Builders<Exercise>.Filter.And(baseFilters))
            .SortBy(x => x.Name)
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

    public Task<ExerciseOptions> Options(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new ExerciseOptions
        {
            Level = Enum.GetNames<ExerciseLevel>().ToList(),
            Sport = Enum.GetNames<ExerciseSport>().ToList()
        });
    }
}
