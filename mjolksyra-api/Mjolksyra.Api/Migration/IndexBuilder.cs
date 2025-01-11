using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Infrastructure.Database;
using MongoDB.Bson;
using MongoDB.Driver;

namespace Mjolksyra.Api.Migration;

public abstract class IndexBuilder : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    protected IndexBuilder(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<IMongoDbContext>();
        
        try
        {
            await Build(context, stoppingToken);
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            
            await Drop(context, stoppingToken);
            await Build(context, stoppingToken);
        }
    }

    protected abstract Task Build(IMongoDbContext context, CancellationToken stoppingToken);

    protected abstract Task Drop(IMongoDbContext context, CancellationToken stoppingToken);
}