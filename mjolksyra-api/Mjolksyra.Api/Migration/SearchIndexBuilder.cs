using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Infrastructure.Database;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Mjolksyra.Api.Migration;

public class SearchIndexBuilder : IndexBuilder
{
    private const string IndexName = "Search";

    public SearchIndexBuilder(IServiceProvider serviceProvider, ILogger<SearchIndexBuilder> logger) : base(serviceProvider, logger)
    {
    }

    protected override async Task Build(IMongoDbContext context, CancellationToken stoppingToken)
    {
        var indexKeys = Builders<Exercise>.IndexKeys
            .Text(x => x.Name);

        await context.Exercises.Indexes
            .CreateOneAsync(new CreateIndexModel<Exercise>(indexKeys, new CreateIndexOptions
            {
                Name = IndexName,
                Weights = new BsonDocument
                {
                    {
                        nameof(Exercise.Name), 10
                    }
                }
            }), cancellationToken: stoppingToken);
    }

    protected override Task Drop(IMongoDbContext context, CancellationToken stoppingToken)
    {
        return context.Exercises.Indexes.DropOneAsync(IndexName, stoppingToken);
    }
}
