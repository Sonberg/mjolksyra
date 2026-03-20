using MassTransit;
using Microsoft.Extensions.Options;
using Moq;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.Messaging.Consumers;
using Mjolksyra.Infrastructure.R2;

namespace Mjolksyra.Infrastructure.Tests.Messaging;

public class PlannedWorkoutDeletedConsumerTests
{
    private const string PublicBaseUrl = "https://media.example.com";

    private static IOptions<R2Options> BuildR2Options() =>
        Options.Create(new R2Options
        {
            AccountId = "test-account",
            BucketName = "test-bucket",
            AccessKeyId = "test-key",
            SecretAccessKey = "test-secret",
            PublicBaseUrl = PublicBaseUrl,
        });

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
    public async Task Consume_WithR2MediaUrls_DeletesExtractedKeys()
    {
        var fileDeleter = new Mock<IR2FileDeleter>();
        var consumer = new PlannedWorkoutDeletedConsumer(fileDeleter.Object, BuildR2Options());

        await consumer.Consume(BuildContext([
            $"{PublicBaseUrl}/workouts/abc.webp",
            $"{PublicBaseUrl}/workouts/xyz.mp4",
        ]).Object);

        fileDeleter.Verify(x => x.DeleteAsync(
            It.Is<IEnumerable<string>>(keys =>
                keys.SequenceEqual(new[] { "workouts/abc.webp", "workouts/xyz.mp4" })),
            CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task Consume_WithLegacyUtfsIoUrls_SkipsNonR2Urls()
    {
        var fileDeleter = new Mock<IR2FileDeleter>();
        var consumer = new PlannedWorkoutDeletedConsumer(fileDeleter.Object, BuildR2Options());

        // Legacy utfs.io URLs do not match the R2 base URL — they are skipped
        await consumer.Consume(BuildContext([
            "https://utfs.io/f/abc123",
            "https://utfs.io/f/xyz789?ct=video",
        ]).Object);

        fileDeleter.Verify(
            x => x.DeleteAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Consume_WithEmptyMediaUrls_DoesNotCallDeleter()
    {
        var fileDeleter = new Mock<IR2FileDeleter>();
        var consumer = new PlannedWorkoutDeletedConsumer(fileDeleter.Object, BuildR2Options());

        await consumer.Consume(BuildContext([]).Object);

        fileDeleter.Verify(
            x => x.DeleteAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Consume_MixedUrls_OnlyDeletesR2Keys()
    {
        var fileDeleter = new Mock<IR2FileDeleter>();
        var consumer = new PlannedWorkoutDeletedConsumer(fileDeleter.Object, BuildR2Options());

        await consumer.Consume(BuildContext([
            $"{PublicBaseUrl}/workouts/newfile.webp",
            "https://utfs.io/f/legacykey",
        ]).Object);

        fileDeleter.Verify(x => x.DeleteAsync(
            It.Is<IEnumerable<string>>(keys => keys.SequenceEqual(new[] { "workouts/newfile.webp" })),
            CancellationToken.None), Times.Once);
    }
}
