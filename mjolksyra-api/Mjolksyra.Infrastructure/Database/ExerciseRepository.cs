using Microsoft.Extensions.Caching.Hybrid;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class ExerciseRepository : IExerciseRepository
{
    private readonly IMongoDbContext _mongoDbContext;

    private readonly HybridCache _cache;

    public ExerciseRepository(IMongoDbContext mongoDbContext, HybridCache cache)
    {
        _mongoDbContext = mongoDbContext;
        _cache = cache;
    }

    public async Task<ICollection<Exercise>> Search(string freeText, CancellationToken cancellationToken = default)
    {
        var projection = Builders<Exercise>.Projection.MetaTextScore("Score");
        var filter = Builders<Exercise>.Filter.Text(freeText, new TextSearchOptions
        {
            CaseSensitive = false,
            DiacriticSensitive = false
        });
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
        return await _cache.GetOrCreateAsync<Paginated<Exercise>>($"Exercises_Get_{limit}", async _ =>
        {
            var response = await _mongoDbContext.Exercises
                .Find(Builders<Exercise>.Filter.Empty)
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
        }, cancellationToken: cancellationToken);
    }

    public async Task<Paginated<Exercise>> Get(Cursor cursor, CancellationToken cancellationToken = default)
    {
        return await _cache.GetOrCreateAsync<Paginated<Exercise>>($"Exercises_Get_{cursor}", async _ =>
        {
            var response = await _mongoDbContext.Exercises
                .Find(Builders<Exercise>.Filter.Empty)
                .SortBy(x => x.Name)
                .Skip(cursor.Page * cursor.Size)
                .Limit(cursor.Size)
                .ToListAsync(cancellationToken);

            return new Paginated<Exercise>
            {
                Data = response,
                Cursor = Cursor.From(response, cursor)
            };
        }, cancellationToken: cancellationToken);
    }

    public async Task<Paginated<Exercise>> Starred(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _cache.GetOrCreateAsync<Paginated<Exercise>>($"Exercises_Starred_{userId}", async _ =>
        {
            var filter = Builders<Exercise>.Filter.AnyIn(x => x.StarredBy, [userId]);
            var result = await _mongoDbContext.Exercises
                .Find(filter)
                .SortBy(x => x.Name)
                .ToListAsync(cancellationToken);

            return new Paginated<Exercise>
            {
                Data = result,
                Cursor = null
            };
        }, cancellationToken: cancellationToken);
    }


    public async Task<bool> Star(Guid exerciseId, Guid userId, CancellationToken cancellationToken = default)
    {
        var update = Builders<Exercise>.Update.AddToSet(x => x.StarredBy, userId);
        var result = await _mongoDbContext.Exercises
            .UpdateOneAsync(x => x.Id == exerciseId, update, new UpdateOptions
            {
                IsUpsert = true
            }, cancellationToken);

        await _cache.RemoveAsync($"Exercises_Starred_{userId}", cancellationToken);

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

        await _cache.RemoveAsync($"Exercises_Starred_{userId}", cancellationToken);

        return result.IsAcknowledged;
    }
}