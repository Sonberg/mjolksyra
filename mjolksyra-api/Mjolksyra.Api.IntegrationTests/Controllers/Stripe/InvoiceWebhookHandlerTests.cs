using MediatR;
using Mjolksyra.Api.Controllers.Stripe;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using Stripe;

namespace Mjolksyra.Api.IntegrationTests.Controllers.Stripe;

public class InvoiceWebhookHandlerTests
{
    [Fact]
    public async Task HandleSucceeded_StoresTransactionWithPaymentIntentId_NotInvoiceId()
    {
        var transactionRepo = new FakeTransactionRepository();
        var traineeId = Guid.NewGuid();
        var athleteId = Guid.NewGuid();
        var coachId = Guid.NewGuid();

        var traineeRepo = new FakeTraineeRepository
        {
            TraineeBySubscriptionId = new Trainee
            {
                Id = traineeId,
                AthleteUserId = athleteId,
                CoachUserId = coachId,
                Status = TraineeStatus.Active,
                Cost = new TraineeCost { Amount = 1000 },
                StripeSubscriptionId = "sub_test123"
            }
        };
        var userRepo = new FakeUserRepository
        {
            UsersById = new Dictionary<Guid, User>
            {
                [athleteId] = CreateUser(athleteId, "athlete@example.com", "Ada", "Athlete"),
                [coachId] = CreateUser(coachId, "coach@example.com", "Carl", "Coach")
            }
        };

        var sut = CreateHandler(traineeRepo, userRepo, transactionRepo);

        var invoice = new Invoice
        {
            Id = "in_test123",
            SubscriptionId = "sub_test123",
            PaymentIntentId = "pi_test456",
            HostedInvoiceUrl = "https://invoice.stripe.com/receipt"
        };

        await sut.HandleSucceeded(invoice, "evt_1");

        Assert.NotNull(transactionRepo.UpsertedTransaction);
        Assert.Equal("pi_test456", transactionRepo.UpsertedTransaction!.PaymentIntentId);
        Assert.NotEqual("in_test123", transactionRepo.UpsertedTransaction.PaymentIntentId);
        Assert.Equal(TraineeTransactionStatus.Succeeded, transactionRepo.UpsertedTransaction.Status);
        Assert.Equal(traineeId, transactionRepo.UpsertedTransaction.TraineeId);
    }

    [Fact]
    public async Task HandleFailed_StoresTransactionWithPaymentIntentId_NotInvoiceId()
    {
        var transactionRepo = new FakeTransactionRepository();
        var traineeId = Guid.NewGuid();
        var athleteId = Guid.NewGuid();
        var coachId = Guid.NewGuid();

        var traineeRepo = new FakeTraineeRepository
        {
            TraineeBySubscriptionId = new Trainee
            {
                Id = traineeId,
                AthleteUserId = athleteId,
                CoachUserId = coachId,
                Status = TraineeStatus.Active,
                Cost = new TraineeCost { Amount = 1000 },
                StripeSubscriptionId = "sub_test123"
            }
        };
        var userRepo = new FakeUserRepository
        {
            UsersById = new Dictionary<Guid, User>
            {
                [athleteId] = CreateUser(athleteId, "athlete@example.com", "Ada", "Athlete"),
                [coachId] = CreateUser(coachId, "coach@example.com", "Carl", "Coach")
            }
        };

        var sut = CreateHandler(traineeRepo, userRepo, transactionRepo);

        var invoice = new Invoice
        {
            Id = "in_test789",
            SubscriptionId = "sub_test123",
            PaymentIntentId = "pi_test999",
            HostedInvoiceUrl = "https://invoice.stripe.com/receipt"
        };

        await sut.HandleFailed(invoice, "evt_2");

        Assert.NotNull(transactionRepo.UpsertedTransaction);
        Assert.Equal("pi_test999", transactionRepo.UpsertedTransaction!.PaymentIntentId);
        Assert.NotEqual("in_test789", transactionRepo.UpsertedTransaction.PaymentIntentId);
        Assert.Equal(TraineeTransactionStatus.Failed, transactionRepo.UpsertedTransaction.Status);
        Assert.Equal(traineeId, transactionRepo.UpsertedTransaction.TraineeId);
    }

    [Fact]
    public async Task HandleSucceeded_WhenSubscriptionIdIsNull_DoesNotUpsertTransaction()
    {
        var transactionRepo = new FakeTransactionRepository();
        var sut = CreateHandler(new FakeTraineeRepository(), new FakeUserRepository(), transactionRepo);

        await sut.HandleSucceeded(new Invoice { Id = "in_test", SubscriptionId = null }, "evt_3");

        Assert.Null(transactionRepo.UpsertedTransaction);
    }

    [Fact]
    public async Task HandleFailed_WhenSubscriptionIdIsNull_DoesNotUpsertTransaction()
    {
        var transactionRepo = new FakeTransactionRepository();
        var sut = CreateHandler(new FakeTraineeRepository(), new FakeUserRepository(), transactionRepo);

        await sut.HandleFailed(new Invoice { Id = "in_test", SubscriptionId = null }, "evt_4");

        Assert.Null(transactionRepo.UpsertedTransaction);
    }

    [Fact]
    public async Task HandleSucceeded_WhenTraineeNotFound_DoesNotUpsertTransaction()
    {
        var transactionRepo = new FakeTransactionRepository();
        var traineeRepo = new FakeTraineeRepository { TraineeBySubscriptionId = null };
        var sut = CreateHandler(traineeRepo, new FakeUserRepository(), transactionRepo);

        await sut.HandleSucceeded(new Invoice { Id = "in_test", SubscriptionId = "sub_unknown" }, "evt_5");

        Assert.Null(transactionRepo.UpsertedTransaction);
    }

    [Fact]
    public async Task HandleFailed_WhenTraineeNotFound_DoesNotUpsertTransaction()
    {
        var transactionRepo = new FakeTransactionRepository();
        var traineeRepo = new FakeTraineeRepository { TraineeBySubscriptionId = null };
        var sut = CreateHandler(traineeRepo, new FakeUserRepository(), transactionRepo);

        await sut.HandleFailed(new Invoice { Id = "in_test", SubscriptionId = "sub_unknown" }, "evt_6");

        Assert.Null(transactionRepo.UpsertedTransaction);
    }

    [Fact]
    public async Task HandleFailed_SetsPaymentFailedAtOnTrainee()
    {
        var traineeId = Guid.NewGuid();
        var athleteId = Guid.NewGuid();
        var coachId = Guid.NewGuid();

        var traineeRepo = new FakeTraineeRepository
        {
            TraineeBySubscriptionId = new Trainee
            {
                Id = traineeId,
                AthleteUserId = athleteId,
                CoachUserId = coachId,
                Status = TraineeStatus.Active,
                Cost = new TraineeCost { Amount = 1000 },
                StripeSubscriptionId = "sub_test123"
            }
        };
        var userRepo = new FakeUserRepository
        {
            UsersById = new Dictionary<Guid, User>
            {
                [athleteId] = CreateUser(athleteId, "athlete@example.com", "Ada", "Athlete"),
                [coachId] = CreateUser(coachId, "coach@example.com", "Carl", "Coach")
            }
        };

        var sut = CreateHandler(traineeRepo, userRepo, new FakeTransactionRepository());

        await sut.HandleFailed(new Invoice { Id = "in_test", SubscriptionId = "sub_test123", PaymentIntentId = "pi_test" }, "evt_7");

        Assert.NotNull(traineeRepo.UpdatedTrainee);
        Assert.NotNull(traineeRepo.UpdatedTrainee!.PaymentFailedAt);
    }

    [Fact]
    public async Task HandleSucceeded_ClearsPaymentFailedAtWhenPreviouslySet()
    {
        var traineeId = Guid.NewGuid();
        var athleteId = Guid.NewGuid();
        var coachId = Guid.NewGuid();

        var traineeRepo = new FakeTraineeRepository
        {
            TraineeBySubscriptionId = new Trainee
            {
                Id = traineeId,
                AthleteUserId = athleteId,
                CoachUserId = coachId,
                Status = TraineeStatus.Active,
                Cost = new TraineeCost { Amount = 1000 },
                StripeSubscriptionId = "sub_test123",
                PaymentFailedAt = DateTimeOffset.UtcNow.AddDays(-1)
            }
        };
        var userRepo = new FakeUserRepository
        {
            UsersById = new Dictionary<Guid, User>
            {
                [athleteId] = CreateUser(athleteId, "athlete@example.com", "Ada", "Athlete"),
                [coachId] = CreateUser(coachId, "coach@example.com", "Carl", "Coach")
            }
        };

        var sut = CreateHandler(traineeRepo, userRepo, new FakeTransactionRepository());

        await sut.HandleSucceeded(new Invoice
        {
            Id = "in_test",
            SubscriptionId = "sub_test123",
            PaymentIntentId = "pi_test",
            HostedInvoiceUrl = "https://invoice.stripe.com/receipt"
        }, "evt_8");

        Assert.NotNull(traineeRepo.UpdatedTrainee);
        Assert.Null(traineeRepo.UpdatedTrainee!.PaymentFailedAt);
    }

    [Fact]
    public async Task HandleSucceeded_WhenPaymentFailedAtNotSet_DoesNotUpdateTrainee()
    {
        var traineeId = Guid.NewGuid();
        var athleteId = Guid.NewGuid();
        var coachId = Guid.NewGuid();

        var traineeRepo = new FakeTraineeRepository
        {
            TraineeBySubscriptionId = new Trainee
            {
                Id = traineeId,
                AthleteUserId = athleteId,
                CoachUserId = coachId,
                Status = TraineeStatus.Active,
                Cost = new TraineeCost { Amount = 1000 },
                StripeSubscriptionId = "sub_test123",
                PaymentFailedAt = null
            }
        };
        var userRepo = new FakeUserRepository
        {
            UsersById = new Dictionary<Guid, User>
            {
                [athleteId] = CreateUser(athleteId, "athlete@example.com", "Ada", "Athlete"),
                [coachId] = CreateUser(coachId, "coach@example.com", "Carl", "Coach")
            }
        };

        var sut = CreateHandler(traineeRepo, userRepo, new FakeTransactionRepository());

        await sut.HandleSucceeded(new Invoice
        {
            Id = "in_test",
            SubscriptionId = "sub_test123",
            PaymentIntentId = "pi_test",
            HostedInvoiceUrl = "https://invoice.stripe.com/receipt"
        }, "evt_9");

        Assert.Null(traineeRepo.UpdatedTrainee);
    }

    private static InvoiceWebhookHandler CreateHandler(
        ITraineeRepository traineeRepo,
        IUserRepository userRepo,
        ITraineeTransactionRepository transactionRepo)
    {
        return new InvoiceWebhookHandler(
            traineeRepo,
            userRepo,
            transactionRepo,
            new FakeEmailSender(),
            new FakeNotificationService(),
            new FakeProcessedStripeEventRepository(),
            new FakeMediator());
    }

    private static User CreateUser(Guid id, string email, string givenName, string familyName) => new()
    {
        Id = id,
        Email = Email.From(email),
        GivenName = givenName,
        FamilyName = familyName,
        ClerkUserId = "clerk_test",
        CreatedAt = DateTimeOffset.UtcNow
    };

    private sealed class FakeTraineeRepository : ITraineeRepository
    {
        public Trainee? TraineeBySubscriptionId { get; set; }
        public Trainee? UpdatedTrainee { get; private set; }

        public Task<Trainee> Create(Trainee trainee, CancellationToken ct) => Task.FromResult(trainee);
        public Task<Trainee> Update(Trainee trainee, CancellationToken ct)
        {
            UpdatedTrainee = trainee;
            return Task.FromResult(trainee);
        }
        public Task<Trainee?> GetById(Guid traineeId, CancellationToken ct) => Task.FromResult<Trainee?>(null);
        public Task<ICollection<Trainee>> GetAllAsync(CancellationToken ct) => Task.FromResult<ICollection<Trainee>>([]);
        public Task<ICollection<Trainee>> Get(Guid userId, CancellationToken ct) => Task.FromResult<ICollection<Trainee>>([]);
        public Task<bool> HasAccess(Guid traineeId, Guid userId, CancellationToken cancellationToken) => Task.FromResult(false);
        public Task<Trainee?> GetBySubscriptionId(string subscriptionId, CancellationToken ct) => Task.FromResult(TraineeBySubscriptionId);
        public Task<int> CountActiveByCoachId(Guid coachUserId, CancellationToken ct) => Task.FromResult(0);
        public Task<bool> ExistsActiveRelationship(Guid coachUserId, Guid athleteUserId, CancellationToken ct) => Task.FromResult(false);
        public Task<Trainee?> GetRelationship(Guid coachUserId, Guid athleteUserId, CancellationToken ct) => Task.FromResult<Trainee?>(null);
        public Task<long> CountActiveAsync(CancellationToken ct) => Task.FromResult(0L);
    }

    private sealed class FakeUserRepository : IUserRepository
    {
        public Dictionary<Guid, User> UsersById { get; set; } = [];
        public User? UserByPlatformSubscriptionId { get; set; }

        public Task<User?> GetByEmail(string email, CancellationToken ct) => Task.FromResult<User?>(null);
        public Task<User?> GetByClerkId(string clerkUserId, CancellationToken ct) => Task.FromResult<User?>(null);
        public Task<User> GetById(Guid id, CancellationToken ct) => Task.FromResult(UsersById[id]);
        public Task<User?> GetByPlatformSubscriptionId(string subscriptionId, CancellationToken ct) => Task.FromResult(UserByPlatformSubscriptionId);
        public Task<ICollection<User>> GetManyById(ICollection<Guid> ids, CancellationToken ct) => Task.FromResult<ICollection<User>>([]);
        public Task<User> Create(User user, CancellationToken ct) => Task.FromResult(user);
        public Task<User> Update(User user, CancellationToken ct) => Task.FromResult(user);
        public Task<ICollection<User>> GetCoachUsersAsync(CancellationToken ct) => Task.FromResult<ICollection<User>>([]);
        public Task<long> CountAsync(CancellationToken ct) => Task.FromResult(0L);
        public Task<long> CountCoachesAsync(CancellationToken ct) => Task.FromResult(0L);
        public Task<long> CountAthletesAsync(CancellationToken ct) => Task.FromResult(0L);
    }

    private sealed class FakeTransactionRepository : ITraineeTransactionRepository
    {
        public TraineeTransaction? UpsertedTransaction { get; private set; }

        public Task<ICollection<TraineeTransaction>> GetByTraineeId(Guid traineeId, CancellationToken ct) =>
            Task.FromResult<ICollection<TraineeTransaction>>([]);
        public Task<ICollection<TraineeTransaction>> GetAllAsync(CancellationToken ct) =>
            Task.FromResult<ICollection<TraineeTransaction>>([]);
        public Task<TraineeTransaction?> GetById(Guid id, CancellationToken ct) => Task.FromResult<TraineeTransaction?>(null);
        public Task<TraineeTransaction?> GetByPaymentIntentId(string paymentIntentId, CancellationToken ct) =>
            Task.FromResult<TraineeTransaction?>(null);
        public Task Upsert(TraineeTransaction transaction, CancellationToken ct)
        {
            UpsertedTransaction = transaction;
            return Task.CompletedTask;
        }
        public Task<decimal> TotalRevenueAsync(CancellationToken ct) => Task.FromResult(0m);
    }

    private sealed class FakeProcessedStripeEventRepository : IProcessedStripeEventRepository
    {
        private readonly HashSet<string> _eventIds = [];

        public Task<bool> TryMarkAsProcessed(string eventId, string eventType, CancellationToken ct)
        {
            return Task.FromResult(_eventIds.Add(eventId));
        }
    }

    private sealed class FakeMediator : IMediator
    {
        public Task Publish(object notification, CancellationToken cancellationToken = default) => Task.CompletedTask;

        public Task Publish<TNotification>(TNotification notification, CancellationToken cancellationToken = default)
            where TNotification : INotification => Task.CompletedTask;

        public Task<TResponse> Send<TResponse>(IRequest<TResponse> request, CancellationToken cancellationToken = default)
            => Task.FromResult(default(TResponse)!);

        public Task Send<TRequest>(TRequest request, CancellationToken cancellationToken = default)
            where TRequest : IRequest
            => Task.CompletedTask;

        public Task<object?> Send(object request, CancellationToken cancellationToken = default)
            => Task.FromResult<object?>(null);

        public IAsyncEnumerable<TResponse> CreateStream<TResponse>(IStreamRequest<TResponse> request, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();

        public IAsyncEnumerable<object?> CreateStream(object request, CancellationToken cancellationToken = default)
            => throw new NotImplementedException();
    }

    private sealed class FakeEmailSender : IEmailSender
    {
        public Task SendInvitation(string email, InvitationEmail invitation, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SendInvitationAcceptedToCoach(string email, InvitationStatusEmail emailModel, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SendInvitationDeclinedToCoach(string email, InvitationStatusEmail emailModel, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SendPaymentMethodRequiredToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SendPaymentSucceededToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SendPaymentFailedToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SendPaymentFailedToCoach(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SendPriceChangedToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SendChargeNowToAthlete(string email, AthleteBillingEmail emailModel, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SendRelationshipCancelled(string email, RelationshipCancelledEmail emailModel, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SendCoachStripeStatusToCoach(string email, CoachStripeStatusEmail emailModel, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SendClerkInvitation(string email, ClerkInvitationEmail emailModel, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SendClerkInvitationAccepted(string email, ClerkInvitationAcceptedEmail emailModel, CancellationToken cancellationToken) => Task.CompletedTask;
        public Task SignUp(string email, CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class FakeNotificationService : INotificationService
    {
        public Task Notify(Guid userId, string type, string title, string? body = null, string? href = null,
            CancellationToken cancellationToken = default) => Task.CompletedTask;
        public Task NotifyMany(IEnumerable<Guid> userIds, string type, string title, string? body = null, string? href = null,
            CancellationToken cancellationToken = default) => Task.CompletedTask;
    }
}
