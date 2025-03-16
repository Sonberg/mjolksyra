using System.Text.Json;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Infrastructure.Database;
using MongoDB.Driver;

namespace Mjolksyra.Api.Migration;

public class ExerciseSeeder : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    public ExerciseSeeder(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var scope = _serviceProvider.CreateScope();

        var context = scope.ServiceProvider.GetRequiredService<IMongoDbContext>();
        var first = await context.Exercises
            .Find(Builders<Exercise>.Filter.Empty)
            .FirstOrDefaultAsync(cancellationToken: stoppingToken);

        if (first is not null)
        {
            return;
        }

        var reader = new StreamReader("./exercises.json");
        var content = await reader.ReadToEndAsync(stoppingToken);

        var exercises = JsonSerializer.Deserialize<List<Exercise>>(content, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        await context.Exercises.InsertManyAsync(exercises, new InsertManyOptions(), stoppingToken);
    }
}