using MassTransit;
using Microsoft.Extensions.Options;
using Moq;
using Mjolksyra.Domain.Database;
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
        Guid workoutId,
        Guid traineeId)
    {
        var context = new Mock<ConsumeContext<PlannedWorkoutDeletedMessage>>();
        context.SetupGet(x => x.Message).Returns(new PlannedWorkoutDeletedMessage
        {
            Workout = new PlannedWorkout
            {
                Id = workoutId,
                TraineeId = traineeId,
                PlannedAt = DateOnly.FromDateTime(DateTime.UtcNow),
                CreatedAt = DateTimeOffset.UtcNow,
                Exercises = [],
            }
        });
        context.SetupGet(x => x.CancellationToken).Returns(CancellationToken.None);
        return context;
    }

    [Fact]
    public async Task Consume_WithR2MediaUrls_DeletesExtractedKeys()
    {
        var workoutId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var fileDeleter = new Mock<IR2FileDeleter>();
        var repository = new Mock<IPlannedWorkoutChatMessageRepository>();
        repository
            .Setup(x => x.GetByWorkoutId(traineeId, workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new PlannedWorkoutChatMessage
                {
                    Id = Guid.NewGuid(),
                    PlannedWorkoutId = workoutId,
                    TraineeId = traineeId,
                    UserId = Guid.NewGuid(),
                    Message = "x",
                    Role = PlannedWorkoutChatRole.Athlete,
                    CreatedAt = DateTimeOffset.UtcNow,
                    ModifiedAt = DateTimeOffset.UtcNow,
                    Media =
                    [
                        new PlannedWorkoutMedia { RawUrl = $"{PublicBaseUrl}/workouts/abc.webp", Type = PlannedWorkoutMediaType.Image },
                        new PlannedWorkoutMedia { RawUrl = $"{PublicBaseUrl}/workouts/xyz.mp4", Type = PlannedWorkoutMediaType.Video }
                    ]
                }
            ]);

        var consumer = new PlannedWorkoutDeletedConsumer(repository.Object, fileDeleter.Object, BuildR2Options());

        await consumer.Consume(BuildContext(workoutId, traineeId).Object);

        fileDeleter.Verify(x => x.DeleteAsync(
            It.Is<IEnumerable<string>>(keys =>
                keys.SequenceEqual(new[] { "workouts/abc.webp", "workouts/xyz.mp4" })),
            CancellationToken.None), Times.Once);
    }

    [Fact]
    public async Task Consume_WithLegacyUtfsIoUrls_SkipsNonR2Urls()
    {
        var workoutId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var fileDeleter = new Mock<IR2FileDeleter>();
        var repository = new Mock<IPlannedWorkoutChatMessageRepository>();
        repository
            .Setup(x => x.GetByWorkoutId(traineeId, workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new PlannedWorkoutChatMessage
                {
                    Id = Guid.NewGuid(),
                    PlannedWorkoutId = workoutId,
                    TraineeId = traineeId,
                    UserId = Guid.NewGuid(),
                    Message = "x",
                    Role = PlannedWorkoutChatRole.Athlete,
                    CreatedAt = DateTimeOffset.UtcNow,
                    ModifiedAt = DateTimeOffset.UtcNow,
                    Media =
                    [
                        new PlannedWorkoutMedia { RawUrl = "https://utfs.io/f/abc123", Type = PlannedWorkoutMediaType.Image },
                        new PlannedWorkoutMedia { RawUrl = "https://utfs.io/f/xyz789?ct=video", Type = PlannedWorkoutMediaType.Video }
                    ]
                }
            ]);
        var consumer = new PlannedWorkoutDeletedConsumer(repository.Object, fileDeleter.Object, BuildR2Options());

        // Legacy utfs.io URLs do not match the R2 base URL — they are skipped
        await consumer.Consume(BuildContext(workoutId, traineeId).Object);

        fileDeleter.Verify(
            x => x.DeleteAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Consume_WithEmptyMediaUrls_DoesNotCallDeleter()
    {
        var workoutId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var fileDeleter = new Mock<IR2FileDeleter>();
        var repository = new Mock<IPlannedWorkoutChatMessageRepository>();
        repository
            .Setup(x => x.GetByWorkoutId(traineeId, workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<PlannedWorkoutChatMessage>());
        var consumer = new PlannedWorkoutDeletedConsumer(repository.Object, fileDeleter.Object, BuildR2Options());

        await consumer.Consume(BuildContext(workoutId, traineeId).Object);

        fileDeleter.Verify(
            x => x.DeleteAsync(It.IsAny<IEnumerable<string>>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Consume_MixedUrls_OnlyDeletesR2Keys()
    {
        var workoutId = Guid.NewGuid();
        var traineeId = Guid.NewGuid();
        var fileDeleter = new Mock<IR2FileDeleter>();
        var repository = new Mock<IPlannedWorkoutChatMessageRepository>();
        repository
            .Setup(x => x.GetByWorkoutId(traineeId, workoutId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([
                new PlannedWorkoutChatMessage
                {
                    Id = Guid.NewGuid(),
                    PlannedWorkoutId = workoutId,
                    TraineeId = traineeId,
                    UserId = Guid.NewGuid(),
                    Message = "x",
                    Role = PlannedWorkoutChatRole.Athlete,
                    CreatedAt = DateTimeOffset.UtcNow,
                    ModifiedAt = DateTimeOffset.UtcNow,
                    Media =
                    [
                        new PlannedWorkoutMedia { RawUrl = $"{PublicBaseUrl}/workouts/newfile.webp", Type = PlannedWorkoutMediaType.Image },
                        new PlannedWorkoutMedia { RawUrl = "https://utfs.io/f/legacykey", Type = PlannedWorkoutMediaType.Image }
                    ]
                }
            ]);
        var consumer = new PlannedWorkoutDeletedConsumer(repository.Object, fileDeleter.Object, BuildR2Options());

        await consumer.Consume(BuildContext(workoutId, traineeId).Object);

        fileDeleter.Verify(x => x.DeleteAsync(
            It.Is<IEnumerable<string>>(keys => keys.SequenceEqual(new[] { "workouts/newfile.webp" })),
            CancellationToken.None), Times.Once);
    }
}
