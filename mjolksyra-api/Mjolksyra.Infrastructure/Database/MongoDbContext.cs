using Microsoft.Extensions.Options;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;
using MongoDB.Driver.Core.Extensions.DiagnosticSources;

namespace Mjolksyra.Infrastructure.Database;

public interface IMongoDbContext
{
    IMongoCollection<RefreshToken> RefreshTokens { get; }

    IMongoCollection<User> Users { get; }

    IMongoCollection<TraineeInvitation> TraineeInvitations { get; }

    IMongoCollection<Exercise> Exercises { get; }

    IMongoCollection<Trainee> Trainees { get; }

    IMongoCollection<PlannedWorkout> PlannedWorkout { get; }

    IMongoCollection<CompletedWorkout> CompletedWorkout { get; }

    IMongoCollection<Block> Blocks { get; }
}

public class MongoDbContext : IMongoDbContext
{
    private readonly MongoClient _mongoClient;

    private IMongoDatabase Database => _mongoClient.GetDatabase("mjolksyra");

    public IMongoCollection<RefreshToken> RefreshTokens => Database.GetCollection<RefreshToken>("refresh-tokens");

    public IMongoCollection<User> Users => Database.GetCollection<User>("users");

    public IMongoCollection<TraineeInvitation> TraineeInvitations => Database.GetCollection<TraineeInvitation>("trainee-invitations");

    public IMongoCollection<Exercise> Exercises => Database.GetCollection<Exercise>("exercises");

    public IMongoCollection<Trainee> Trainees => Database.GetCollection<Trainee>("trainees");

    public IMongoCollection<PlannedWorkout> PlannedWorkout => Database.GetCollection<PlannedWorkout>("planned-workouts");

    public IMongoCollection<CompletedWorkout> CompletedWorkout => Database.GetCollection<CompletedWorkout>("completed-workouts");

    public IMongoCollection<Block> Blocks => Database.GetCollection<Block>("blocks");

    public MongoDbContext(IOptions<MongoOptions> options)
    {
        var settings = MongoClientSettings.FromConnectionString(options.Value.ConnectionString);

        settings.ClusterConfigurator = cb => cb.Subscribe(new DiagnosticsActivityEventSubscriber(new InstrumentationOptions
        {
            CaptureCommandText = true,
        }));

        _mongoClient = new MongoClient(settings);
    }
}