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

    IMongoCollection<CompletedWorkout> CompletedWorkout { get; }

    IMongoCollection<Block> Blocks { get; }

    IMongoCollection<Notification> Notifications { get; }

    IMongoCollection<FeedbackReport> FeedbackReports { get; }

    IMongoCollection<TraineeTransaction> TraineeTransactions { get; }

    IMongoCollection<DiscountCode> DiscountCodes { get; }

    IMongoCollection<Plan> Plans { get; }

    IMongoCollection<CoachAiCredits> CoachAiCredits { get; }

    IMongoCollection<AiCreditActionPricing> AiCreditActionPricings { get; }

    IMongoCollection<AiCreditPack> AiCreditPacks { get; }

    IMongoCollection<AiCreditLedger> AiCreditLedger { get; }

    IMongoCollection<ProcessedStripeEvent> ProcessedStripeEvents { get; }
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

    public IMongoCollection<CompletedWorkout> CompletedWorkout => Database.GetCollection<CompletedWorkout>("completed-workouts");

    public IMongoCollection<Block> Blocks => Database.GetCollection<Block>("blocks");

    public IMongoCollection<Notification> Notifications => Database.GetCollection<Notification>("notifications");

    public IMongoCollection<FeedbackReport> FeedbackReports => Database.GetCollection<FeedbackReport>("feedback-reports");

    public IMongoCollection<TraineeTransaction> TraineeTransactions => Database.GetCollection<TraineeTransaction>("trainee-transactions");

    public IMongoCollection<DiscountCode> DiscountCodes => Database.GetCollection<DiscountCode>("discount-codes");

    public IMongoCollection<Plan> Plans => Database.GetCollection<Plan>("plans");

    public IMongoCollection<CoachAiCredits> CoachAiCredits => Database.GetCollection<CoachAiCredits>("coach-ai-credits");

    public IMongoCollection<AiCreditActionPricing> AiCreditActionPricings => Database.GetCollection<AiCreditActionPricing>("ai-credit-action-pricings");

    public IMongoCollection<AiCreditPack> AiCreditPacks => Database.GetCollection<AiCreditPack>("ai-credit-packs");

    public IMongoCollection<AiCreditLedger> AiCreditLedger => Database.GetCollection<AiCreditLedger>("ai-credit-ledger");

    public IMongoCollection<ProcessedStripeEvent> ProcessedStripeEvents => Database.GetCollection<ProcessedStripeEvent>("processed-stripe-events");

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
