using MassTransit;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.UploadThing;

namespace Mjolksyra.Infrastructure.Messaging.Consumers;

public class PlannedWorkoutDeletedConsumer(IUploadThingFileDeleter fileDeleter)
    : IConsumer<PlannedWorkoutDeletedMessage>
{
    public Task Consume(ConsumeContext<PlannedWorkoutDeletedMessage> context)
    {
        var fileKeys = context.Message.Workout.MediaUrls
            .Select(ExtractFileKey)
            .Where(k => !string.IsNullOrEmpty(k))
            .ToList();

        if (fileKeys.Count == 0) return Task.CompletedTask;

        return fileDeleter.DeleteAsync(fileKeys, context.CancellationToken);
    }

    // "https://utfs.io/f/abc123?ct=video" → "abc123"
    public static string ExtractFileKey(string url)
    {
        var withoutQuery = url.Contains('?') ? url[..url.IndexOf('?')] : url;
        var idx = withoutQuery.IndexOf("/f/", StringComparison.Ordinal);
        return idx >= 0 ? withoutQuery[(idx + 3)..] : string.Empty;
    }
}
