using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Infrastructure.Database;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Mjolksyra.Api.Migration;

public class SearchIndexBuilder : IndexBuilder
{
    private const string IndexName = "Search";

    public SearchIndexBuilder(IServiceProvider serviceProvider) : base(serviceProvider)
    {
    }

    protected override async Task Build(IMongoDbContext context, CancellationToken stoppingToken)
    {
        var indexKeys = Builders<Exercise>.IndexKeys
            .Text(x => x.Name)
            .Text(x => x.Category)
            .Text(x => x.Equipment)
            .Text(x => x.Level)
            .Text(x => x.Force)
            .Text(x => x.Mechanic)
            .Text(x => x.PrimaryMuscles)
            .Text(x => x.SecondaryMuscles);

        await context.Exercises.Indexes
            .CreateOneAsync(new CreateIndexModel<Exercise>(indexKeys, new CreateIndexOptions
            {
                Name = IndexName,
                Weights = new BsonDocument
                {
                    {
                        nameof(Exercise.Name), 10
                    },
                    {
                        nameof(Exercise.Level), 1
                    },
                    {
                        nameof(Exercise.Force), 1
                    },
                    {
                        nameof(Exercise.Mechanic), 1
                    },
                    {
                        nameof(Exercise.PrimaryMuscles), 1
                    },
                    {
                        nameof(Exercise.SecondaryMuscles), 1
                    },
                    {
                        nameof(Exercise.Category), 5
                    }
                }
            }), cancellationToken: stoppingToken);
    }

    protected override Task Drop(IMongoDbContext context, CancellationToken stoppingToken)
    {
        return context.Exercises.Indexes.DropOneAsync(IndexName, stoppingToken);
    }
}