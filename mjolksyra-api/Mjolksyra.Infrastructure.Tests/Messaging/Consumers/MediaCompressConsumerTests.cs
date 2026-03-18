using MassTransit;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.Messaging.Consumers;
using Mjolksyra.Infrastructure.UploadThing;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;

namespace Mjolksyra.Infrastructure.Tests.Messaging.Consumers;

public class MediaCompressConsumerTests
{
    private static Mock<ConsumeContext<MediaCompressionRequestedMessage>> BuildContext(
        string fileUrl,
        Guid? traineeId = null,
        Guid? workoutId = null)
    {
        var context = new Mock<ConsumeContext<MediaCompressionRequestedMessage>>();
        context.SetupGet(x => x.Message).Returns(new MediaCompressionRequestedMessage
        {
            FileUrl = fileUrl,
            TraineeId = traineeId ?? Guid.NewGuid(),
            PlannedWorkoutId = workoutId ?? Guid.NewGuid(),
        });
        context.SetupGet(x => x.CancellationToken).Returns(CancellationToken.None);
        return context;
    }

    [Fact]
    public async Task Consume_WhenDownloadFails_LogsWarningAndDoesNotThrow()
    {
        var httpClientFactory = new Mock<IHttpClientFactory>();
        httpClientFactory.Setup(x => x.CreateClient(It.IsAny<string>()))
            .Returns(new HttpClient(new FailingHandler()));

        var fileUploader = new Mock<IUploadThingFileUploader>();
        var fileDeleter = new Mock<IUploadThingFileDeleter>();
        var repository = new Mock<IPlannedWorkoutRepository>();

        var consumer = new MediaCompressConsumer(
            httpClientFactory.Object,
            fileUploader.Object,
            fileDeleter.Object,
            repository.Object,
            NullLogger<MediaCompressConsumer>.Instance);

        // Should not throw — graceful degradation
        await consumer.Consume(BuildContext("https://utfs.io/f/abc123?raw=1").Object);

        // Repository and uploader should not have been touched
        repository.Verify(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()), Times.Never);
        fileUploader.Verify(x => x.UploadAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Consume_WhenUploadFails_LogsWarningAndDoesNotThrow()
    {
        var httpClientFactory = new Mock<IHttpClientFactory>();
        httpClientFactory.Setup(x => x.CreateClient(It.IsAny<string>()))
            .Returns(new HttpClient(new FakeImageHandler()));

        var fileUploader = new Mock<IUploadThingFileUploader>();
        fileUploader
            .Setup(x => x.UploadAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("upload failed"));

        var fileDeleter = new Mock<IUploadThingFileDeleter>();
        var repository = new Mock<IPlannedWorkoutRepository>();

        var consumer = new MediaCompressConsumer(
            httpClientFactory.Object,
            fileUploader.Object,
            fileDeleter.Object,
            repository.Object,
            NullLogger<MediaCompressConsumer>.Instance);

        // Should not throw
        await consumer.Consume(BuildContext("https://utfs.io/f/abc123?raw=1").Object);

        repository.Verify(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Consume_OnSuccess_ReplacesUrlAndDeletesRawFile()
    {
        var workoutId = Guid.NewGuid();
        var rawUrl = "https://utfs.io/f/rawkey123?raw=1";
        var compressedUrl = "https://utfs.io/f/compressedkey456";

        var httpClientFactory = new Mock<IHttpClientFactory>();
        httpClientFactory.Setup(x => x.CreateClient(It.IsAny<string>()))
            .Returns(new HttpClient(new FakeImageHandler()));

        var fileUploader = new Mock<IUploadThingFileUploader>();
        fileUploader
            .Setup(x => x.UploadAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(compressedUrl);

        var fileDeleter = new Mock<IUploadThingFileDeleter>();

        var workout = new PlannedWorkout
        {
            Id = workoutId,
            TraineeId = Guid.NewGuid(),
            PlannedAt = new DateOnly(2026, 3, 15),
            Exercises = [],
            CreatedAt = DateTimeOffset.UtcNow,
            MediaUrls = [rawUrl],
        };

        var repository = new Mock<IPlannedWorkoutRepository>();
        // Use It.IsAny<Guid>() to avoid Guid equality issues in Moq
        repository.Setup(x => x.Get(It.IsAny<Guid>(), It.IsAny<CancellationToken>())).ReturnsAsync(workout);

        PlannedWorkout? savedWorkout = null;
        repository
            .Setup(x => x.Update(It.IsAny<PlannedWorkout>(), It.IsAny<CancellationToken>()))
            .Callback<PlannedWorkout, CancellationToken>((w, _) => savedWorkout = w)
            .Returns(Task.CompletedTask); // explicit return prevents awaiting null

        var consumer = new MediaCompressConsumer(
            httpClientFactory.Object,
            fileUploader.Object,
            fileDeleter.Object,
            repository.Object,
            NullLogger<MediaCompressConsumer>.Instance);

        await consumer.Consume(BuildContext(rawUrl, workoutId: workoutId).Object);

        // URL should be replaced in DB
        Assert.NotNull(savedWorkout);
        Assert.Contains(compressedUrl, savedWorkout!.MediaUrls);
        Assert.DoesNotContain(rawUrl, savedWorkout.MediaUrls);

        // Raw file key should be deleted from UploadThing
        fileDeleter.Verify(x => x.DeleteAsync(
            It.Is<IEnumerable<string>>(keys => keys.Contains("rawkey123")),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    // Valid 1×1 PNG generated by ImageSharp (correct CRCs guaranteed)
    private static readonly byte[] MinimalPngBytes = CreateValidPng();

    private static byte[] CreateValidPng()
    {
        using var image = new Image<Rgba32>(1, 1, new Rgba32(255, 0, 0));
        using var ms = new MemoryStream();
        image.SaveAsPng(ms);
        return ms.ToArray();
    }

    private class FailingHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
            => throw new HttpRequestException("Simulated network error");
    }

    private class FakeImageHandler : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            var response = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
            {
                Content = new ByteArrayContent(MinimalPngBytes)
            };
            response.Content.Headers.ContentType =
                new System.Net.Http.Headers.MediaTypeHeaderValue("image/png");
            return Task.FromResult(response);
        }
    }

}
