using MassTransit;
using Moq;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.Messaging;
using Mjolksyra.Infrastructure.Messaging.Consumers;
using Mjolksyra.Infrastructure.UploadThing;

namespace Mjolksyra.Infrastructure.Tests.Messaging;

public class PlannedWorkoutDeletedConsumerTests
{
    private static Mock<ConsumeContext<PlannedWorkoutDeletedMessage>> BuildContext(
        ICollection<string> mediaUrls)
    {
        var context = new Mock<ConsumeContext<PlannedWorkoutDeletedMessage>>();
        context.SetupGet(x => x.Message).Returns(new PlannedWorkoutDeletedMessage
        {
            Workout = new PlannedWorkout
            {
                Id = Guid.NewGuid(),
                TraineeId = Guid.NewGuid(),
                PlannedAt = DateOnly.FromDateTime(DateTime.UtcNow),
                CreatedAt = DateTimeOffset.UtcNow,
                Exercises = [],
                MediaUrls = mediaUrls
            }
        });
        context.SetupGet(x => x.CancellationToken).Returns(CancellationToken.None);
        return context;
    }

    [Fact]
    public async Task Consume_WithMediaUrls_DeletesExtractedFileKeys()
    {
        var fileDeleter = new Mock<IUploadThingFileDeleter>();
        var consumer = new PlannedWorkoutDeletedConsumer(fileDeleter.Object);

        await consumer.Consume(BuildContext([
            "https://utfs.io/f/abc123",
            "https://utfs.io/f/xyz789?ct=video"
        ]).Object);

        fileDeleter.Verify(x => x.DeleteAsync(
            It.Is<IEnumerable<string>>(keys =>
                keys.SequenceEqual(new[] { "abc123", "xyz789" })),
            CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task Consume_WithEmptyMediaUrls_DoesNotCallDeleter()
    {
        var fileDeleter = new Mock<IUploadThingFileDeleter>();
        var consumer = new PlannedWorkoutDeletedConsumer(fileDeleter.Object);

        await consumer.Consume(BuildContext([]).Object);

        fileDeleter.Verify(
            x => x.DeleteAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Theory]
    [InlineData("https://utfs.io/f/abc123", "abc123")]
    [InlineData("https://utfs.io/f/abc123?ct=video", "abc123")]
    [InlineData("https://utfs.io/f/some-key-with-dashes", "some-key-with-dashes")]
    public void ExtractFileKey_ReturnsKeyPart(string url, string expectedKey)
    {
        var result = PlannedWorkoutDeletedConsumer.ExtractFileKey(url);
        Assert.Equal(expectedKey, result);
    }
}
