using MassTransit;
using Microsoft.Extensions.Options;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Infrastructure.R2;

namespace Mjolksyra.Infrastructure.Messaging.Consumers;

public class PlannedWorkoutDeletedConsumer(
    ICompletedWorkoutChatMessageRepository repository,
    IR2FileDeleter fileDeleter,
    IOptions<R2Options> r2Options) : IConsumer<PlannedWorkoutDeletedMessage>
{
    public async Task Consume(ConsumeContext<PlannedWorkoutDeletedMessage> context)
    {
        var publicBaseUrl = r2Options.Value.PublicBaseUrl;
        var messages = await repository.GetByWorkoutId(context.Message.Workout.TraineeId, context.Message.Workout.Id, context.CancellationToken);
        var allUrls = messages
            .SelectMany(m => m.Media.SelectMany(x => new[]
            {
                x.CompressedUrl, x.RawUrl
            }))
            .OfType<string>();

        var keys = allUrls
            .Select(url => R2UrlHelper.ExtractKey(url, publicBaseUrl))
            .Where(k => !string.IsNullOrEmpty(k))
            .Distinct()
            .ToList();

        if (keys.Count == 0) return;

        await fileDeleter.DeleteAsync(keys, context.CancellationToken);
    }
}