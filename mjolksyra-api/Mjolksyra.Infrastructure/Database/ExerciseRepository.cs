using Mjolksyra.Domain.Database;
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

    public async Task<ICollection<Exercise>> SearchAsync(string freeText, CancellationToken cancellationToken = default)
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

    public Task<ICollection<Exercise>> GetAsync(CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<ICollection<Exercise>> GetLikedAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<Exercise> LikeAsync(Guid exerciseId, Guid userId, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    public Task<Exercise> UnlikeAsync(Guid exerciseId, Guid userId, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}