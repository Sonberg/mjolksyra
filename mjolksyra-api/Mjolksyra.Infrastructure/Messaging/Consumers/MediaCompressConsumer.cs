using MassTransit;
using Microsoft.Extensions.Logging;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Media;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.R2;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;
using Xabe.FFmpeg;

namespace Mjolksyra.Infrastructure.Messaging.Consumers;

public class MediaCompressConsumer(
    IHttpClientFactory httpClientFactory,
    IR2FileUploader fileUploader,
    IPlannedWorkoutRepository plannedWorkoutRepository,
    ILogger<MediaCompressConsumer> logger) : IConsumer<MediaCompressionRequestedMessage>
{
    private const int MaxImageDimension = 1920;
    private const int ImageQuality = 80;
    private const int MaxVideoDimension = 1280;

    public async Task Consume(ConsumeContext<MediaCompressionRequestedMessage> context)
    {
        var msg = context.Message;
        var ct = context.CancellationToken;

        try
        {
            var rawUrl = msg.FileUrl;
            var isVideo = MediaUrlHelper.IsVideoUrl(rawUrl);

            // Download raw file
            var http = httpClientFactory.CreateClient();
            await using var rawStream = await http.GetStreamAsync(rawUrl, ct);

            string compressedUrl;
            if (isVideo)
            {
                compressedUrl = await CompressVideoAsync(rawStream, rawUrl, msg.PlannedWorkoutId, ct);
            }
            else
            {
                compressedUrl = await CompressImageAsync(rawStream, rawUrl, msg.PlannedWorkoutId, ct);
            }

            await plannedWorkoutRepository.SetMediaCompressedUrl(msg.PlannedWorkoutId, rawUrl, compressedUrl, ct);
        }
        catch (Exception ex)
        {
            // Graceful degradation: raw URL is valid and visible to users.
            // Log and let the message ack without re-queuing.
            logger.LogWarning(ex,
                "Media compression failed for {FileUrl} (workout {PlannedWorkoutId}). Raw URL preserved.",
                msg.FileUrl, msg.PlannedWorkoutId);
        }
    }

    private async Task<string> CompressImageAsync(Stream rawStream, string rawUrl, Guid plannedWorkoutId, CancellationToken ct)
    {
        using var image = await Image.LoadAsync(rawStream, ct);

        // Downscale if larger than max dimension
        if (image.Width > MaxImageDimension || image.Height > MaxImageDimension)
        {
            image.Mutate(x => x.Resize(new ResizeOptions
            {
                Size = new Size(MaxImageDimension, MaxImageDimension),
                Mode = ResizeMode.Max,
            }));
        }

        using var outputStream = new MemoryStream();
        await image.SaveAsync(outputStream, new WebpEncoder { Quality = ImageQuality }, ct);
        outputStream.Position = 0;

        var key = $"workouts/{plannedWorkoutId}/{BaseName(rawUrl)}-compressed.webp";
        return await fileUploader.UploadAsync(outputStream, key, "image/webp", ct);
    }

    private async Task<string> CompressVideoAsync(Stream rawStream, string rawUrl, Guid plannedWorkoutId, CancellationToken ct)
    {
        // Use Guid-based paths — Path.GetTempFileName() creates a file on disk that would leak
        var inputPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid():N}.mp4");
        var outputPath = Path.Combine(Path.GetTempPath(), $"{Guid.NewGuid():N}_compressed.mp4");

        try
        {
            await using (var fs = File.OpenWrite(inputPath))
            {
                await rawStream.CopyToAsync(fs, ct);
            }

            var conversion = await FFmpeg.Conversions.FromSnippet.ToMp4(inputPath, outputPath);
            conversion
                .AddParameter($"-vf scale='min({MaxVideoDimension},iw):-2'")
                .AddParameter("-crf 28")
                .AddParameter("-preset fast")
                .AddParameter("-c:a aac")
                .AddParameter("-movflags +faststart");

            await conversion.Start(ct);

            await using var compressedFs = File.OpenRead(outputPath);
            var key = $"workouts/{plannedWorkoutId}/{BaseName(rawUrl)}-compressed.mp4";
            return await fileUploader.UploadAsync(compressedFs, key, "video/mp4", ct);
        }
        finally
        {
            TryDelete(inputPath);
            TryDelete(outputPath);
        }
    }

    /// <summary>Returns the filename without extension from a URL, stripping any query string.</summary>
    private static string BaseName(string url)
    {
        try
        {
            var path = new Uri(url).AbsolutePath;
            return Path.GetFileNameWithoutExtension(path);
        }
        catch
        {
            var path = url.Contains('?') ? url[..url.IndexOf('?')] : url;
            return Path.GetFileNameWithoutExtension(path);
        }
    }

    private static void TryDelete(string path)
    {
        try { File.Delete(path); }
        catch { /* ignore */ }
    }
}
