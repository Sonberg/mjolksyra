using Microsoft.Extensions.Options;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;
using MongoDB.Driver.Core.Extensions.DiagnosticSources;

namespace Mjolksyra.Infrastructure.Database;

public interface IMongoDbContext
{
    IMongoCollection<User> Users { get; }

    IMongoCollection<UserInvitation> UserInvitations { get; }

    IMongoCollection<Exercise> Exercises { get; }

    IMongoCollection<Trainee> Trainees { get; }

    IMongoCollection<PlannedWorkout> PlannedWorkout { get; }

    IMongoCollection<CompletedWorkout> CompletedWorkout { get; }
}

public class MongoDbContext : IMongoDbContext
{
    private readonly MongoClient _mongoClient;

    private IMongoDatabase Database => _mongoClient.GetDatabase("mjolksyra");

    public IMongoCollection<User> Users => Database.GetCollection<User>("users");

    public IMongoCollection<UserInvitation> UserInvitations => Database.GetCollection<UserInvitation>("user-invitations");

    public IMongoCollection<Exercise> Exercises => Database.GetCollection<Exercise>("exercises");

    public IMongoCollection<Trainee> Trainees => Database.GetCollection<Trainee>("trainees");

    public IMongoCollection<PlannedWorkout> PlannedWorkout => Database.GetCollection<PlannedWorkout>("planned-workouts");

    public IMongoCollection<CompletedWorkout> CompletedWorkout => Database.GetCollection<CompletedWorkout>("completed-workouts");

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