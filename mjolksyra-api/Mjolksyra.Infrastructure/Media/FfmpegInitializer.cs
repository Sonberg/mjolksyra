using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Xabe.FFmpeg;
using Xabe.FFmpeg.Downloader;

namespace Mjolksyra.Infrastructure.Media;

public class FfmpegInitializer(ILogger<FfmpegInitializer> logger) : IHostedService
{
    private static readonly string FfmpegDir =
        Path.Combine(Path.GetTempPath(), "mjolksyra-ffmpeg");

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(FfmpegDir);

        var ffmpeg = OperatingSystem.IsWindows() ? "ffmpeg.exe" : "ffmpeg";
        var ffprobe = OperatingSystem.IsWindows() ? "ffprobe.exe" : "ffprobe";

        if (File.Exists(Path.Combine(FfmpegDir, ffmpeg)) &&
            File.Exists(Path.Combine(FfmpegDir, ffprobe)))
        {
            logger.LogInformation("FFmpeg binaries already present at {Path}, skipping download.", FfmpegDir);
            FFmpeg.SetExecutablesPath(FfmpegDir);
            return;
        }

        logger.LogInformation("Downloading FFmpeg to {Path}…", FfmpegDir);
        await FFmpegDownloader.GetLatestVersion(FFmpegVersion.Official, FfmpegDir);
        logger.LogInformation("FFmpeg download complete.");

        FFmpeg.SetExecutablesPath(FfmpegDir);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
