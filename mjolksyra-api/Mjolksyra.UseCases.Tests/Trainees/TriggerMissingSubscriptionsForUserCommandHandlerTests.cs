using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.UseCases.Trainees.TriggerMissingSubscriptionsForUser;

namespace Mjolksyra.UseCases.Tests.Trainees;

public class TriggerMissingSubscriptionsForUserCommandHandlerTests
{
    [Fact]
    public async Task Handle_WhenTraineeHasNoPriorSubscription_AndHasPrice_PublishesSyncMessage()
    {
        var userId = Guid.NewGuid();
        var trainee = new Trainee
        {
            Id = Guid.NewGuid(),
            CoachUserId = userId,
            AthleteUserId = Guid.NewGuid(),
            Status = TraineeStatus.Active,
            Cost = new TraineeCost { Amount = 500 },
            StripeSubscriptionId = null,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.Get(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trainee> { trainee });

        var syncPublisher = new Mock<ITraineeSubscriptionSyncPublisher>();

        var handler = new TriggerMissingSubscriptionsForUserCommandHandler(
            traineeRepository.Object, syncPublisher.Object);

        await handler.Handle(new TriggerMissingSubscriptionsForUserCommand(userId), CancellationToken.None);

        syncPublisher.Verify(x => x.Publish(
            It.Is<TraineeSubscriptionSyncMessage>(m =>
                m.TraineeId == trainee.Id &&
                m.BillingMode == TraineeSubscriptionSyncBillingMode.NextCycle),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WhenTraineeAlreadyHasSubscription_DoesNotPublishSyncMessage()
    {
        var userId = Guid.NewGuid();
        var trainee = new Trainee
        {
            Id = Guid.NewGuid(),
            CoachUserId = userId,
            AthleteUserId = Guid.NewGuid(),
            Status = TraineeStatus.Active,
            Cost = new TraineeCost { Amount = 500 },
            StripeSubscriptionId = "sub_existing",
            CreatedAt = DateTimeOffset.UtcNow
        };

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.Get(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trainee> { trainee });

        var syncPublisher = new Mock<ITraineeSubscriptionSyncPublisher>();

        var handler = new TriggerMissingSubscriptionsForUserCommandHandler(
            traineeRepository.Object, syncPublisher.Object);

        await handler.Handle(new TriggerMissingSubscriptionsForUserCommand(userId), CancellationToken.None);

        syncPublisher.Verify(x => x.Publish(
            It.IsAny<TraineeSubscriptionSyncMessage>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_WhenTraineeHasNoPriceSet_DoesNotPublishSyncMessage()
    {
        var userId = Guid.NewGuid();
        var trainee = new Trainee
        {
            Id = Guid.NewGuid(),
            CoachUserId = userId,
            AthleteUserId = Guid.NewGuid(),
            Status = TraineeStatus.Active,
            Cost = new TraineeCost { Amount = 0 },
            StripeSubscriptionId = null,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var traineeRepository = new Mock<ITraineeRepository>();
        traineeRepository.Setup(x => x.Get(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Trainee> { trainee });

        var syncPublisher = new Mock<ITraineeSubscriptionSyncPublisher>();

        var handler = new TriggerMissingSubscriptionsForUserCommandHandler(
            traineeRepository.Object, syncPublisher.Object);

        await handler.Handle(new TriggerMissingSubscriptionsForUserCommand(userId), CancellationToken.None);

        syncPublisher.Verify(x => x.Publish(
            It.IsAny<TraineeSubscriptionSyncMessage>(),
            It.IsAny<CancellationToken>()), Times.Never);
    }
}
