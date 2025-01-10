using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Infrastructure.Database;
using MongoDB.Driver;

namespace Mjolksyra.Api.Migration;

public class PlannedExerciseIndexBuilder : IndexBuilder
{
    private const string IndexName = "PlannedExercise";

    public PlannedExerciseIndexBuilder(IServiceProvider serviceProvider) : base(serviceProvider)
    {
    }

    protected override async Task Build(IMongoDbContext context, CancellationToken stoppingToken)
    {
        var indexKeys = Builders<PlannedWorkout>.IndexKeys
            .Ascending(x => x.PlannedAt)
            .Ascending(x => x.TraineeId);

        await context.PlannedWorkout.Indexes
            .CreateOneAsync(new CreateIndexModel<PlannedWorkout>(indexKeys, new CreateIndexOptions
            {
                Name = IndexName,
                Unique = true
            }), cancellationToken: stoppingToken);
    }

    protected override async Task Drop(IMongoDbContext context, CancellationToken stoppingToken)
    {
        await context.PlannedWorkout.Indexes.DropOneAsync(IndexName, stoppingToken);
    }
}