using Microsoft.AspNetCore.Mvc;
using Moq;
using Mjolksyra.Api.Common.UserEvents;
using Mjolksyra.Api.Controllers.Stripe;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Stripe;

namespace Mjolksyra.Api.IntegrationTests.Controllers.Stripe;

public class SetupIntentSyncTests
{
    private static SetupIntentController CreateController(
        IStripeClient stripeClient,
        IUserContext userContext,
        IUserRepository userRepository,
        ITraineeRepository traineeRepository,
        IUserEventPublisher? userEvents = null)
    {
        return new SetupIntentController(
            stripeClient,
            userContext,
            userRepository,
            traineeRepository,
            userEvents ?? Mock.Of<IUserEventPublisher>());
    }

    private static User BuildAthleteUser(Guid id, string customerId = "cus_test") => new()
    {
        Id = id,
        ClerkUserId = id.ToString(),
        Email = Email.From("athlete@example.com"),
        GivenName = "Ada",
        FamilyName = "Athlete",
        CreatedAt = DateTimeOffset.UtcNow,
        Athlete = new UserAthlete
        {
            Stripe = new UserAthleteStripe
            {
                CustomerId = customerId,
                PaymentMethodId = "pm_old",
                Status = StripeStatus.Succeeded
            }
        }
    };

    private static Trainee BuildTrainee(Guid athleteId, string? subscriptionId = null, DateTimeOffset? paymentFailedAt = null) => new()
    {
        Id = Guid.NewGuid(),
        AthleteUserId = athleteId,
        CoachUserId = Guid.NewGuid(),
        Status = TraineeStatus.Active,
        Cost = new TraineeCost { Amount = 500 },
        StripeSubscriptionId = subscriptionId,
        PaymentFailedAt = paymentFailedAt,
        CreatedAt = DateTimeOffset.UtcNow
    };

    private static Mock<IStripeClient> BuildStripeClientMock(
        string customerId = "cus_test",
        string setupIntentStatus = "succeeded",
        string paymentMethodId = "pm_new")
    {
        var mock = new Mock<IStripeClient>();
        mock.SetupGet(x => x.ApiBase).Returns(StripeClient.DefaultApiBase);
        mock.SetupGet(x => x.ApiKey).Returns("sk_test_dummy");
        mock.SetupGet(x => x.ClientId).Returns(string.Empty);
        mock.SetupGet(x => x.ConnectBase).Returns(StripeClient.DefaultConnectBase);
        mock.SetupGet(x => x.FilesBase).Returns(StripeClient.DefaultFilesBase);
        mock.SetupGet(x => x.MeterEventsBase).Returns(StripeClient.DefaultMeterEventsBase);

        mock.Setup(x => x.RequestAsync<SetupIntent>(
                It.IsAny<HttpMethod>(),
                It.IsAny<string>(),
                It.IsAny<BaseOptions>(),
                It.IsAny<RequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SetupIntent
            {
                Id = "si_test",
                Status = setupIntentStatus,
                PaymentMethodId = paymentMethodId,
                CustomerId = customerId,
                Customer = new Customer { Id = customerId }
            });

        mock.Setup(x => x.RequestAsync<Subscription>(
                It.IsAny<HttpMethod>(),
                It.IsAny<string>(),
                It.IsAny<BaseOptions>(),
                It.IsAny<RequestOptions>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Subscription { Id = "sub_test", Status = "active" });

        return mock;
    }

    [Fact]
    public async Task Sync_WhenSucceeded_ClearsPaymentFailedAtOnTraineesWithFailedPayment()
    {
        var athleteId = Guid.NewGuid();
        var user = BuildAthleteUser(athleteId);
        var trainee = BuildTrainee(athleteId, subscriptionId: "sub_test", paymentFailedAt: DateTimeOffset.UtcNow.AddDays(-1));

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUser(It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var updatedTrainees = new List<Trainee>();
        var traineeRepo = new Mock<ITraineeRepository>();
        traineeRepo.Setup(x => x.Get(athleteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trainee> { trainee });
        traineeRepo.Setup(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()))
            .Callback<Trainee, CancellationToken>((t, _) => updatedTrainees.Add(t))
            .ReturnsAsync((Trainee t, CancellationToken _) => t);

        var stripeClient = BuildStripeClientMock();
        var sut = CreateController(stripeClient.Object, userContext.Object, userRepo.Object, traineeRepo.Object);

        var result = await sut.Sync(new SyncSetupIntentRequest { SetupIntentId = "si_test" }, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result);
        var updatedTrainee = updatedTrainees.FirstOrDefault(t => t.Id == trainee.Id);
        Assert.NotNull(updatedTrainee);
        Assert.Null(updatedTrainee!.PaymentFailedAt);
    }

    [Fact]
    public async Task Sync_WhenSucceeded_UpdatesSubscriptionDefaultPaymentMethod()
    {
        var athleteId = Guid.NewGuid();
        var user = BuildAthleteUser(athleteId);
        var trainee = BuildTrainee(athleteId, subscriptionId: "sub_test");

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUser(It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var traineeRepo = new Mock<ITraineeRepository>();
        traineeRepo.Setup(x => x.Get(athleteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trainee> { trainee });
        traineeRepo.Setup(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee t, CancellationToken _) => t);

        var stripeClient = BuildStripeClientMock(paymentMethodId: "pm_new");
        var sut = CreateController(stripeClient.Object, userContext.Object, userRepo.Object, traineeRepo.Object);

        var result = await sut.Sync(new SyncSetupIntentRequest { SetupIntentId = "si_test" }, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result);
        // Verify Stripe was called with a subscription update (PATCH to subscriptions/sub_test)
        stripeClient.Verify(x => x.RequestAsync<Subscription>(
            HttpMethod.Post,
            It.Is<string>(s => s.Contains("sub_test")),
            It.IsAny<BaseOptions>(),
            It.IsAny<RequestOptions>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Sync_WhenNoActiveSubscriptions_DoesNotCallSubscriptionUpdate()
    {
        var athleteId = Guid.NewGuid();
        var user = BuildAthleteUser(athleteId);
        var trainee = BuildTrainee(athleteId, subscriptionId: null);

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.GetUser(It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var userRepo = new Mock<IUserRepository>();
        userRepo.Setup(x => x.Update(It.IsAny<User>(), It.IsAny<CancellationToken>())).ReturnsAsync(user);

        var traineeRepo = new Mock<ITraineeRepository>();
        traineeRepo.Setup(x => x.Get(athleteId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trainee> { trainee });

        var stripeClient = BuildStripeClientMock();
        var sut = CreateController(stripeClient.Object, userContext.Object, userRepo.Object, traineeRepo.Object);

        await sut.Sync(new SyncSetupIntentRequest { SetupIntentId = "si_test" }, CancellationToken.None);

        // No subscription update should be made
        stripeClient.Verify(x => x.RequestAsync<Subscription>(
            It.IsAny<HttpMethod>(),
            It.IsAny<string>(),
            It.IsAny<BaseOptions>(),
            It.IsAny<RequestOptions>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }
}
