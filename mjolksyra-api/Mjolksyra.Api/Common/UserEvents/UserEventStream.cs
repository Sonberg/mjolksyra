using System.Collections.Concurrent;
using System.Text.Json;
using System.Threading.Channels;

namespace Mjolksyra.Api.Common.UserEvents;

public class UserEventStream : IUserEventPublisher
{
    private readonly ConcurrentDictionary<Guid, ConcurrentDictionary<Guid, Channel<UserEventMessage>>> _subscriptions = new();

    public (Guid SubscriptionId, ChannelReader<UserEventMessage> Reader) Subscribe(Guid userId)
    {
        var subscriptionId = Guid.NewGuid();
        var channel = Channel.CreateUnbounded<UserEventMessage>(new UnboundedChannelOptions
        {
            SingleReader = true,
            SingleWriter = false
        });

        var group = _subscriptions.GetOrAdd(userId, _ => new ConcurrentDictionary<Guid, Channel<UserEventMessage>>());
        group[subscriptionId] = channel;

        return (subscriptionId, channel.Reader);
    }

    public void Unsubscribe(Guid userId, Guid subscriptionId)
    {
        if (!_subscriptions.TryGetValue(userId, out var group))
        {
            return;
        }

        if (group.TryRemove(subscriptionId, out var channel))
        {
            channel.Writer.TryComplete();
        }

        if (group.IsEmpty)
        {
            _subscriptions.TryRemove(userId, out _);
        }
    }

    public Task Publish(Guid userId, string type, object? payload = null, CancellationToken cancellationToken = default)
    {
        if (!_subscriptions.TryGetValue(userId, out var group) || group.IsEmpty)
        {
            return Task.CompletedTask;
        }

        var message = new UserEventMessage
        {
            Type = type,
            Data = payload is null ? "{}" : JsonSerializer.Serialize(payload)
        };

        foreach (var entry in group)
        {
            entry.Value.Writer.TryWrite(message);
        }

        return Task.CompletedTask;
    }
}

public class UserEventMessage
{
    public required string Type { get; set; }

    public required string Data { get; set; }
}
