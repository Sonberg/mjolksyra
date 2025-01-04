using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Infrastructure.Database;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Mjolksyra.Api.Migration;

public class IndexBuilder : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public IndexBuilder(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        const string name = "Search";
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IMongoDbContext>();

        try
        {
            await Build(name, stoppingToken);
        }
        catch
        {
            await context.Exercises.Indexes.DropOneAsync(name, stoppingToken);
            await Build(name, stoppingToken);
        }
    }

    private async Task Build(string name, CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<IMongoDbContext>();
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
                Name = name,
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
}