using MassTransit;
using Microsoft.Extensions.Logging;
using Mjolksyra.Domain.Database;
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
            var isVideo = IsVideoUrl(rawUrl);

            // Download raw file
            var http = httpClientFactory.CreateClient();
            await using var rawStream = await http.GetStreamAsync(rawUrl, ct);

            string compressedUrl;
            if (isVideo)
            {
                compressedUrl = await CompressVideoAsync(rawStream, ct);
            }
            else
            {
                compressedUrl = await CompressImageAsync(rawStream, ct);
            }

            // Set compressed URL on the media item (raw file is preserved)
            await SetCompressedUrlAsync(msg.PlannedWorkoutId, rawUrl, compressedUrl, ct);
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

    private async Task SetCompressedUrlAsync(
        Guid plannedWorkoutId,
        string rawUrl,
        string compressedUrl,
        CancellationToken ct)
    {
        var workout = await plannedWorkoutRepository.Get(plannedWorkoutId, ct);
        if (workout is null) return;

        var item = workout.Media.FirstOrDefault(m => m.RawUrl == rawUrl);
        if (item is null) return; // already processed or not found

        item.CompressedUrl = compressedUrl;
        await plannedWorkoutRepository.Update(workout, ct);
    }

    private async Task<string> CompressImageAsync(Stream rawStream, CancellationToken ct)
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

        var key = $"workouts/{Guid.NewGuid():N}.webp";
        return await fileUploader.UploadAsync(outputStream, key, "image/webp", ct);
    }

    private async Task<string> CompressVideoAsync(Stream rawStream, CancellationToken ct)
    {
        // Write raw stream to a temp file so FFmpeg can read it
        var inputPath = Path.GetTempFileName() + ".mp4";
        var outputPath = Path.GetTempFileName() + "_compressed.mp4";

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
            var key = $"workouts/{Guid.NewGuid():N}.mp4";
            return await fileUploader.UploadAsync(compressedFs, key, "video/mp4", ct);
        }
        finally
        {
            TryDelete(inputPath);
            TryDelete(outputPath);
        }
    }

    private static bool IsVideoUrl(string url)
    {
        try
        {
            var uri = new Uri(url);
            // Legacy UploadThing URLs tagged with ?ct=video
            if (uri.Query.Contains("ct=video")) return true;
            // R2 URLs: check extension on path
            var path = uri.AbsolutePath;
            return path.EndsWith(".mp4") || path.EndsWith(".mov") || path.EndsWith(".webm");
        }
        catch
        {
            var path = url.Contains('?') ? url[..url.IndexOf('?')] : url;
            return path.EndsWith(".mp4") || path.EndsWith(".mov") || path.EndsWith(".webm");
        }
    }

    private static void TryDelete(string path)
    {
        try { File.Delete(path); }
        catch { /* ignore */ }
    }
}
