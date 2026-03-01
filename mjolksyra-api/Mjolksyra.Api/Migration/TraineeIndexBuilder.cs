using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Infrastructure.Database;
using MongoDB.Driver;

namespace Mjolksyra.Api.Migration;

public class TraineeIndexBuilder : IndexBuilder
{
    private const string IndexName = "Trainee";

    public TraineeIndexBuilder(IServiceProvider serviceProvider, ILogger<TraineeIndexBuilder> logger) : base(serviceProvider, logger)
    {
    }

    protected override async Task Build(IMongoDbContext context, CancellationToken stoppingToken)
    {
        var indexKeys = Builders<Trainee>.IndexKeys
            .Ascending(x => x.AthleteUserId)
            .Ascending(x => x.CoachUserId);

        await context.Trainees.Indexes
            .CreateOneAsync(new CreateIndexModel<Trainee>(indexKeys, new CreateIndexOptions
            {
                Name = IndexName,
                Unique = true
            }), cancellationToken: stoppingToken);
    }

    protected override async Task Drop(IMongoDbContext context, CancellationToken stoppingToken)
    {
        await context.Trainees.Indexes.DropOneAsync(IndexName, stoppingToken);
    }
}
