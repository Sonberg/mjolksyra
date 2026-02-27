using Microsoft.Extensions.Configuration;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Email;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.UseCases.TraineeInvitations.InviteTrainee;

namespace Mjolksyra.Api.IntegrationTests;

public class InviteTraineeCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenMonthlyPriceIsInvalid_ReturnsInvalidMonthlyPriceError()
    {
        var sut = CreateHandler();

        var result = await sut.Handle(new InviteTraineeCommand
        {
            CoachUserId = Guid.NewGuid(),
            Email = "athlete@example.com",
            MonthlyPriceAmount = 0
        }, CancellationToken.None);

        var error = result.AsT1;
        Assert.Equal(InviteTraineeErrorCode.InvalidMonthlyPrice, error.Code);
        Assert.Equal("Monthly price must be greater than zero.", error.Message);
    }

    [Fact]
    public async Task Handle_WhenRelationshipIsMissing_ReturnsRelationshipRequiredError()
    {
        var userRepository = new FakeUserRepository
        {
            UserByEmail = CreateUser("athlete@example.com"),
            UserById = CreateUser("coach@example.com")
        };
        var traineeRepository = new FakeTraineeRepository
        {
            ExistsActiveRelationshipResult = false
        };
        var sut = CreateHandler(userRepository: userRepository, traineeRepository: traineeRepository);

        var result = await sut.Handle(new InviteTraineeCommand
        {
            CoachUserId = Guid.NewGuid(),
            Email = "athlete@example.com",
            MonthlyPriceAmount = 1000
        }, CancellationToken.None);

        var error = result.AsT1;
        Assert.Equal(InviteTraineeErrorCode.RelationshipRequired, error.Code);
        Assert.Equal("Coach can only invite athletes they are already coaching.", error.Message);
    }

    [Fact]
    public async Task Handle_WhenPendingInviteExists_ReturnsPendingInviteAlreadyExistsError()
    {
        var userRepository = new FakeUserRepository
        {
            UserByEmail = CreateUser("athlete@example.com"),
            UserById = CreateUser("coach@example.com")
        };
        var traineeRepository = new FakeTraineeRepository
        {
            ExistsActiveRelationshipResult = true
        };
        var invitationRepository = new FakeTraineeInvitationsRepository
        {
            PendingCount = 1
        };

        var sut = CreateHandler(
            userRepository: userRepository,
            traineeRepository: traineeRepository,
            invitationsRepository: invitationRepository);

        var result = await sut.Handle(new InviteTraineeCommand
        {
            CoachUserId = Guid.NewGuid(),
            Email = "athlete@example.com",
            MonthlyPriceAmount = 1000
        }, CancellationToken.None);

        var error = result.AsT1;
        Assert.Equal(InviteTraineeErrorCode.PendingInviteAlreadyExists, error.Code);
        Assert.Equal("Coach can only have one pending invite to the same athlete.", error.Message);
    }

    private static InviteTraineeCommandHandler CreateHandler(
        ITraineeInvitationsRepository? invitationsRepository = null,
        IUserRepository? userRepository = null,
        ITraineeRepository? traineeRepository = null)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["App:BaseUrl"] = "http://localhost:3000"
            })
            .Build();

        return new InviteTraineeCommandHandler(
            invitationsRepository ?? new FakeTraineeInvitationsRepository(),
            userRepository ?? new FakeUserRepository(),
            new FakeEmailSender(),
            new FakeNotificationService(),
            configuration,
            traineeRepository ?? new FakeTraineeRepository());
    }

    private static User CreateUser(string email)
    {
        return new User
        {
            Id = Guid.NewGuid(),
            Email = Email.From(email),
            GivenName = "Test",
            FamilyName = "User",
            ClerkUserId = "clerk_test",
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    private sealed class FakeTraineeInvitationsRepository : ITraineeInvitationsRepository
    {
        public int PendingCount { get; set; }

        public Task<TraineeInvitation> Create(TraineeInvitation invitation, CancellationToken cancellationToken) =>
            Task.FromResult(invitation);

        public Task<ICollection<TraineeInvitation>> GetAsync(string email, CancellationToken cancellationToken) =>
            Task.FromResult<ICollection<TraineeInvitation>>([]);

        public Task<TraineeInvitation> GetByIdAsync(Guid coachUserId, CancellationToken cancellationToken) =>
            throw new NotImplementedException();

        public Task<ICollection<TraineeInvitation>> GetByCoachAsync(Guid coachUserId, CancellationToken cancellationToken) =>
            Task.FromResult<ICollection<TraineeInvitation>>([]);

        public Task<int> CountPendingByCoachAndEmailAsync(Guid coachUserId, string email, CancellationToken cancellationToken) =>
            Task.FromResult(PendingCount);

        public Task AcceptAsync(Guid id, CancellationToken cancellationToken) => Task.CompletedTask;

        public Task RejectAsync(Guid id, CancellationToken cancellationToken) => Task.CompletedTask;
    }

    private sealed class FakeUserRepository : IUserRepository
    {
        public User? UserByEmail { get; set; }
        public User? UserById { get; set; }

        public Task<User?> GetByEmail(string email, CancellationToken ct) => Task.FromResult(UserByEmail);

        public Task<User?> GetByClerkId(string clerkUserId, CancellationToken ct) => Task.FromResult<User?>(null);

        public Task<User> GetById(Guid id, CancellationToken ct) => Task.FromResult(UserById!);

        public Task<ICollection<User>> GetManyById(ICollection<Guid> ids, CancellationToken ct) =>
            Task.FromResult<ICollection<User>>([]);

        public Task<User> Create(User user, CancellationToken ct) => Task.FromResult(user);

        public Task<User> Update(User user, CancellationToken ct) => Task.FromResult(user);
    }

    private sealed class FakeTraineeRepository : ITraineeRepository
    {
        public bool ExistsActiveRelationshipResult { get; set; }

        public Task<Trainee> Create(Trainee trainee, CancellationToken ct) => Task.FromResult(trainee);

        public Task<Trainee> Update(Trainee trainee, CancellationToken ct) => Task.FromResult(trainee);

        public Task<Trainee?> GetById(Guid traineeId, CancellationToken ct) => Task.FromResult<Trainee?>(null);

        public Task<ICollection<Trainee>> Get(Guid userId, CancellationToken ct) => Task.FromResult<ICollection<Trainee>>([]);

        public Task<bool> HasAccess(Guid traineeId, Guid userId, CancellationToken cancellationToken) => Task.FromResult(false);

        public Task<Trainee?> GetBySubscriptionId(string subscriptionId, CancellationToken ct) => Task.FromResult<Trainee?>(null);

        public Task<int> CountActiveByCoachId(Guid coachUserId, CancellationToken ct) => Task.FromResult(0);

        public Task<bool> ExistsActiveRelationship(Guid coachUserId, Guid athleteUserId, CancellationToken ct) =>
            Task.FromResult(ExistsActiveRelationshipResult);
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
