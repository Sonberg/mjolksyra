using MassTransit;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.R2;

namespace Mjolksyra.Infrastructure.Messaging.Consumers;

public class PlannedWorkoutDeletedConsumer(IR2FileDeleter fileDeleter, IOptions<R2Options> r2Options)
    : IConsumer<PlannedWorkoutDeletedMessage>
{
    public Task Consume(ConsumeContext<PlannedWorkoutDeletedMessage> context)
    {
        var publicBaseUrl = r2Options.Value.PublicBaseUrl;

        var allUrls = context.Message.Workout.Media
            .SelectMany(m => new[] { m.RawUrl, m.CompressedUrl })
            .OfType<string>();

        var keys = allUrls
            .Select(url => R2UrlHelper.ExtractKey(url, publicBaseUrl))
            .Where(k => !string.IsNullOrEmpty(k))
            .Distinct()
            .ToList();

        if (keys.Count == 0) return Task.CompletedTask;

        return fileDeleter.DeleteAsync(keys, context.CancellationToken);
    }
}
