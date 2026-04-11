using Microsoft.Extensions.Options;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;
using MongoDB.Driver.Core.Extensions.DiagnosticSources;

namespace Mjolksyra.Infrastructure.Database;

public interface IMongoDbContext
{
    IMongoCollection<User> Users { get; }

    IMongoCollection<TraineeInvitation> TraineeInvitations { get; }

    IMongoCollection<Exercise> Exercises { get; }

    IMongoCollection<Trainee> Trainees { get; }

    IMongoCollection<PlannedWorkout> PlannedWorkout { get; }

    IMongoCollection<CompletedWorkoutChatMessage> CompletedWorkoutChatMessages { get; }
    
    IMongoCollection<Block> Blocks { get; }

    IMongoCollection<Notification> Notifications { get; }

    IMongoCollection<FeedbackReport> FeedbackReports { get; }

    IMongoCollection<TraineeTransaction> TraineeTransactions { get; }

    IMongoCollection<DiscountCode> DiscountCodes { get; }

    IMongoCollection<Plan> Plans { get; }

    IMongoCollection<WorkoutMediaAnalysisRecord> WorkoutMediaAnalyses { get; }

    IMongoCollection<UserCredits> UserCredits { get; }

    IMongoCollection<CreditActionPricing> CreditActionPricings { get; }

    IMongoCollection<CreditPack> CreditPacks { get; }

    IMongoCollection<CreditLedger> CreditLedger { get; }

    IMongoCollection<ProcessedStripeEvent> ProcessedStripeEvents { get; }

    IMongoCollection<PlannerSession> PlannerSessions { get; }

    IMongoCollection<CompletedWorkout> CompletedWorkouts { get; }
}

public class MongoDbContext : IMongoDbContext
{
    private readonly MongoClient _mongoClient;

    private IMongoDatabase Database => _mongoClient.GetDatabase("mjolksyra");

    public IMongoCollection<User> Users => Database.GetCollection<User>("users");

    public IMongoCollection<TraineeInvitation> TraineeInvitations => Database.GetCollection<TraineeInvitation>("trainee-invitations");

    public IMongoCollection<Exercise> Exercises => Database.GetCollection<Exercise>("exercises");

    public IMongoCollection<Trainee> Trainees => Database.GetCollection<Trainee>("trainees");

    public IMongoCollection<PlannedWorkout> PlannedWorkout => Database.GetCollection<PlannedWorkout>("planned-workouts");

    public IMongoCollection<CompletedWorkoutChatMessage> CompletedWorkoutChatMessages => Database.GetCollection<CompletedWorkoutChatMessage>("completed-workout-chat-messages");

    public IMongoCollection<Block> Blocks => Database.GetCollection<Block>("blocks");

    public IMongoCollection<Notification> Notifications => Database.GetCollection<Notification>("notifications");

    public IMongoCollection<FeedbackReport> FeedbackReports => Database.GetCollection<FeedbackReport>("feedback-reports");

    public IMongoCollection<TraineeTransaction> TraineeTransactions => Database.GetCollection<TraineeTransaction>("trainee-transactions");

    public IMongoCollection<DiscountCode> DiscountCodes => Database.GetCollection<DiscountCode>("discount-codes");

    public IMongoCollection<Plan> Plans => Database.GetCollection<Plan>("plans");

    public IMongoCollection<WorkoutMediaAnalysisRecord> WorkoutMediaAnalyses => Database.GetCollection<WorkoutMediaAnalysisRecord>("completed-workout-analyses");

    public IMongoCollection<UserCredits> UserCredits => Database.GetCollection<UserCredits>("user-credits");

    public IMongoCollection<CreditActionPricing> CreditActionPricings => Database.GetCollection<CreditActionPricing>("credit-action-pricings");

    public IMongoCollection<CreditPack> CreditPacks => Database.GetCollection<CreditPack>("credit-packs");

    public IMongoCollection<CreditLedger> CreditLedger => Database.GetCollection<CreditLedger>("credit-ledger");

    public IMongoCollection<ProcessedStripeEvent> ProcessedStripeEvents => Database.GetCollection<ProcessedStripeEvent>("processed-stripe-events");

    public IMongoCollection<PlannerSession> PlannerSessions => Database.GetCollection<PlannerSession>("ai-planner-sessions");

    public IMongoCollection<CompletedWorkout> CompletedWorkouts => Database.GetCollection<CompletedWorkout>("completed-workouts");

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
