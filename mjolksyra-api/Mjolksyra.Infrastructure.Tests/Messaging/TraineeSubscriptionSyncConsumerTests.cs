using MassTransit;
using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.Messaging;
using Mjolksyra.Infrastructure.Messaging.Consumers;
using Mjolksyra.Infrastructure.Stripe;
using Stripe;
using DomainEmail = Mjolksyra.Domain.Database.Models.Email;

namespace Mjolksyra.Infrastructure.Tests.Messaging;

public class TraineeSubscriptionSyncConsumerTests
{
    private static TraineeSubscriptionSyncConsumer Create(
        ITraineeRepository? traineeRepository = null,
        IUserRepository? userRepository = null,
        IStripePriceService? priceService = null,
        IStripeSubscriptionService? subscriptionService = null)
    {
        return new TraineeSubscriptionSyncConsumer(
            traineeRepository ?? Mock.Of<ITraineeRepository>(),
            userRepository ?? Mock.Of<IUserRepository>(),
            priceService ?? Mock.Of<IStripePriceService>(),
            subscriptionService ?? Mock.Of<IStripeSubscriptionService>());
    }

    private static Mock<ConsumeContext<TraineeSubscriptionSyncMessage>> BuildContext(
        Guid traineeId,
        TraineeSubscriptionSyncBillingMode billingMode = TraineeSubscriptionSyncBillingMode.ChargeNow)
    {
        var context = new Mock<ConsumeContext<TraineeSubscriptionSyncMessage>>();
        context.SetupGet(x => x.Message).Returns(new TraineeSubscriptionSyncMessage
        {
            TraineeId = traineeId,
            BillingMode = billingMode
        });
        context.SetupGet(x => x.CancellationToken).Returns(CancellationToken.None);
        return context;
    }

    private static Trainee BuildTrainee(string? subscriptionId = null)
    {
        return new Trainee
        {
            Id = Guid.NewGuid(),
            CoachUserId = Guid.NewGuid(),
            AthleteUserId = Guid.NewGuid(),
            Status = TraineeStatus.Active,
            Cost = new TraineeCost { Amount = 500 },
            StripeSubscriptionId = subscriptionId,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    private static User BuildAthlete(Guid id)
    {
        return new User
        {
            Id = id,
            Email = DomainEmail.From("athlete@example.com"),
            Athlete = new UserAthlete
            {
                Stripe = new UserAthleteStripe
                {
                    CustomerId = "cus_athlete",
                    PaymentMethodId = "pm_athlete",
                    Status = StripeStatus.Succeeded
                }
            },
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    private static User BuildCoach(Guid id)
    {
        return new User
        {
            Id = id,
            Email = DomainEmail.From("coach@example.com"),
            Coach = new UserCoach
            {
                Stripe = new UserCoachStripe
                {
                    AccountId = "acct_coach",
                    Status = StripeStatus.Succeeded
                }
            },
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    [Fact]
    public async Task Consume_WhenTraineeNotFound_DoesNothing()
    {
        var traineeId = Guid.NewGuid();
        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(traineeId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee?)null);

        var subscriptionService = new Mock<IStripeSubscriptionService>();
        var consumer = Create(traineeRepository: traineeRepository.Object, subscriptionService: subscriptionService.Object);

        await consumer.Consume(BuildContext(traineeId).Object);

        subscriptionService.Verify(x => x.CreateAsync(It.IsAny<SubscriptionCreateOptions>(), It.IsAny<CancellationToken>()), Times.Never);
        traineeRepository.Verify(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Consume_WhenStripeNotConfigured_DoesNothing()
    {
        var trainee = BuildTrainee();
        var athlete = new User
        {
            Id = trainee.AthleteUserId,
            Email = DomainEmail.From("athlete@example.com"),
            // No Stripe setup
            CreatedAt = DateTimeOffset.UtcNow
        };
        var coach = BuildCoach(trainee.CoachUserId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(trainee.Id, It.IsAny<CancellationToken>())).ReturnsAsync(trainee);

        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetById(trainee.AthleteUserId, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        userRepository.Setup(x => x.GetById(trainee.CoachUserId, It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var priceService = new Mock<IStripePriceService>();
        var consumer = Create(traineeRepository.Object, userRepository.Object, priceService.Object);

        await consumer.Consume(BuildContext(trainee.Id).Object);

        priceService.Verify(x => x.CreateAsync(It.IsAny<PriceCreateOptions>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Consume_WhenNextCycleAndExistingSubscription_UpdatesSubscriptionPrice()
    {
        var trainee = BuildTrainee(subscriptionId: "sub_existing");
        var athlete = BuildAthlete(trainee.AthleteUserId);
        var coach = BuildCoach(trainee.CoachUserId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(trainee.Id, It.IsAny<CancellationToken>())).ReturnsAsync(trainee);

        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetById(trainee.AthleteUserId, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        userRepository.Setup(x => x.GetById(trainee.CoachUserId, It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var existingSubscription = new Subscription
        {
            Id = "sub_existing",
            Items = new StripeList<SubscriptionItem>
            {
                Data = [new SubscriptionItem { Id = "si_existing" }]
            }
        };

        var newPrice = new Price { Id = "price_new" };

        var subscriptionService = new Mock<IStripeSubscriptionService>();
        subscriptionService.Setup(x => x.GetAsync("sub_existing", It.IsAny<SubscriptionGetOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingSubscription);

        var priceService = new Mock<IStripePriceService>();
        priceService.Setup(x => x.CreateAsync(It.IsAny<PriceCreateOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newPrice);

        var consumer = Create(traineeRepository.Object, userRepository.Object, priceService.Object, subscriptionService.Object);

        await consumer.Consume(BuildContext(trainee.Id, TraineeSubscriptionSyncBillingMode.NextCycle).Object);

        subscriptionService.Verify(x => x.UpdateAsync(
            "sub_existing",
            It.Is<SubscriptionUpdateOptions>(o => o.Items != null && o.Items.Any(i => i.Price == "price_new")),
            It.IsAny<CancellationToken>()), Times.Once);
        subscriptionService.Verify(x => x.CreateAsync(It.IsAny<SubscriptionCreateOptions>(), It.IsAny<CancellationToken>()), Times.Never);
        traineeRepository.Verify(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Consume_WhenChargeNowAndExistingSubscription_CancelsOldAndCreatesNew()
    {
        var trainee = BuildTrainee(subscriptionId: "sub_old");
        var athlete = BuildAthlete(trainee.AthleteUserId);
        var coach = BuildCoach(trainee.CoachUserId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(trainee.Id, It.IsAny<CancellationToken>())).ReturnsAsync(trainee);
        traineeRepository.Setup(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee t, CancellationToken _) => t);

        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetById(trainee.AthleteUserId, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        userRepository.Setup(x => x.GetById(trainee.CoachUserId, It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var priceService = new Mock<IStripePriceService>();
        priceService.Setup(x => x.CreateAsync(It.IsAny<PriceCreateOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Price { Id = "price_new" });

        var newSubscription = new Subscription { Id = "sub_new" };
        var subscriptionService = new Mock<IStripeSubscriptionService>();
        subscriptionService.Setup(x => x.CancelAsync("sub_old", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Subscription { Id = "sub_old" });
        subscriptionService.Setup(x => x.CreateAsync(It.IsAny<SubscriptionCreateOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(newSubscription);

        var consumer = Create(traineeRepository.Object, userRepository.Object, priceService.Object, subscriptionService.Object);

        await consumer.Consume(BuildContext(trainee.Id, TraineeSubscriptionSyncBillingMode.ChargeNow).Object);

        subscriptionService.Verify(x => x.CancelAsync("sub_old", It.IsAny<CancellationToken>()), Times.Once);
        subscriptionService.Verify(x => x.CreateAsync(It.IsAny<SubscriptionCreateOptions>(), It.IsAny<CancellationToken>()), Times.Once);
        traineeRepository.Verify(x => x.Update(It.Is<Trainee>(t => t.StripeSubscriptionId == "sub_new"), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Consume_WhenNextCycleAndNoExistingSubscription_CreatesNewSubscriptionWithTrialEnd()
    {
        var trainee = BuildTrainee(subscriptionId: null);
        var athlete = BuildAthlete(trainee.AthleteUserId);
        var coach = BuildCoach(trainee.CoachUserId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(trainee.Id, It.IsAny<CancellationToken>())).ReturnsAsync(trainee);
        traineeRepository.Setup(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee t, CancellationToken _) => t);

        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetById(trainee.AthleteUserId, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        userRepository.Setup(x => x.GetById(trainee.CoachUserId, It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var priceService = new Mock<IStripePriceService>();
        priceService.Setup(x => x.CreateAsync(It.IsAny<PriceCreateOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Price { Id = "price_123" });

        var subscriptionService = new Mock<IStripeSubscriptionService>();
        subscriptionService.Setup(x => x.CreateAsync(It.IsAny<SubscriptionCreateOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Subscription { Id = "sub_new" });

        var consumer = Create(traineeRepository.Object, userRepository.Object, priceService.Object, subscriptionService.Object);

        await consumer.Consume(BuildContext(trainee.Id, TraineeSubscriptionSyncBillingMode.NextCycle).Object);

        subscriptionService.Verify(x => x.CreateAsync(
            It.Is<SubscriptionCreateOptions>(o => o.TrialEnd != null),
            It.IsAny<CancellationToken>()), Times.Once);
        traineeRepository.Verify(x => x.Update(It.Is<Trainee>(t => t.StripeSubscriptionId == "sub_new"), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Consume_WhenNoExistingSubscription_CreatesNewSubscription()
    {
        var trainee = BuildTrainee(subscriptionId: null);
        var athlete = BuildAthlete(trainee.AthleteUserId);
        var coach = BuildCoach(trainee.CoachUserId);

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.GetById(trainee.Id, It.IsAny<CancellationToken>())).ReturnsAsync(trainee);
        traineeRepository.Setup(x => x.Update(It.IsAny<Trainee>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Trainee t, CancellationToken _) => t);

        var userRepository = new Mock<IUserRepository>();
        userRepository.Setup(x => x.GetById(trainee.AthleteUserId, It.IsAny<CancellationToken>())).ReturnsAsync(athlete);
        userRepository.Setup(x => x.GetById(trainee.CoachUserId, It.IsAny<CancellationToken>())).ReturnsAsync(coach);

        var priceService = new Mock<IStripePriceService>();
        priceService.Setup(x => x.CreateAsync(It.IsAny<PriceCreateOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Price { Id = "price_123" });

        var subscriptionService = new Mock<IStripeSubscriptionService>();
        subscriptionService.Setup(x => x.CreateAsync(It.IsAny<SubscriptionCreateOptions>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Subscription { Id = "sub_new" });

        var consumer = Create(traineeRepository.Object, userRepository.Object, priceService.Object, subscriptionService.Object);

        await consumer.Consume(BuildContext(trainee.Id).Object);

        subscriptionService.Verify(x => x.CancelAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
        subscriptionService.Verify(x => x.CreateAsync(It.IsAny<SubscriptionCreateOptions>(), It.IsAny<CancellationToken>()), Times.Once);
        traineeRepository.Verify(x => x.Update(It.Is<Trainee>(t => t.StripeSubscriptionId == "sub_new"), It.IsAny<CancellationToken>()), Times.Once);
    }
}
