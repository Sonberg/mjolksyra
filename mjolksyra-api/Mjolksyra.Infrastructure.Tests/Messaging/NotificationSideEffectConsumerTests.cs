using MassTransit;
using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.Infrastructure.Messaging;
using Mjolksyra.Infrastructure.Messaging.Consumers;
using Mjolksyra.Infrastructure.Notifications;

namespace Mjolksyra.Infrastructure.Tests.Messaging;

public class NotificationSideEffectConsumerTests
{
    private static (NotificationSideEffectConsumer consumer, Mock<INotificationRepository> repo, Mock<INotificationRealtimePublisher> publisher)
        CreateSingle()
    {
        var repo = new Mock<INotificationRepository>();
        repo.Setup(x => x.Create(It.IsAny<Notification>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Notification n, CancellationToken _) => n);

        var publisher = new Mock<INotificationRealtimePublisher>();
        var notificationService = new NotificationService(repo.Object, publisher.Object);

        return (new NotificationSideEffectConsumer(notificationService), repo, publisher);
    }

    private static (NotificationSideEffectManyConsumer consumer, Mock<INotificationRepository> repo, Mock<INotificationRealtimePublisher> publisher)
        CreateMany()
    {
        var repo = new Mock<INotificationRepository>();
        repo.Setup(x => x.Create(It.IsAny<Notification>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Notification n, CancellationToken _) => n);

        var publisher = new Mock<INotificationRealtimePublisher>();
        var notificationService = new NotificationService(repo.Object, publisher.Object);

        return (new NotificationSideEffectManyConsumer(notificationService), repo, publisher);
    }

    [Fact]
    public async Task Consume_NotificationMessage_PersistsAndPublishesRealtime()
    {
        var (consumer, repo, publisher) = CreateSingle();
        var userId = Guid.NewGuid();

        var context = new Mock<ConsumeContext<NotificationSideEffectMessage>>();
        context.SetupGet(x => x.Message).Returns(new NotificationSideEffectMessage
        {
            UserId = userId,
            Type = "test",
            Title = "Hello",
            Body = "Body text",
            Href = "/some/path"
        });
        context.SetupGet(x => x.CancellationToken).Returns(CancellationToken.None);

        await consumer.Consume(context.Object);

        repo.Verify(x => x.Create(
            It.Is<Notification>(n => n.UserId == userId && n.Title == "Hello"),
            CancellationToken.None), Times.Once);
        publisher.Verify(x => x.PublishChanged(userId, CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task Consume_NotificationManyMessage_NotifiesEachUser()
    {
        var (consumer, repo, publisher) = CreateMany();
        var userId1 = Guid.NewGuid();
        var userId2 = Guid.NewGuid();

        var context = new Mock<ConsumeContext<NotificationSideEffectManyMessage>>();
        context.SetupGet(x => x.Message).Returns(new NotificationSideEffectManyMessage
        {
            UserIds = [userId1, userId2],
            Type = "test",
            Title = "Broadcast",
        });
        context.SetupGet(x => x.CancellationToken).Returns(CancellationToken.None);

        await consumer.Consume(context.Object);

        repo.Verify(x => x.Create(It.IsAny<Notification>(), CancellationToken.None), Times.Exactly(2));
        publisher.Verify(x => x.PublishChanged(userId1, CancellationToken.None), Times.Once);
        publisher.Verify(x => x.PublishChanged(userId2, CancellationToken.None), Times.Once);
    }
}
