namespace Mjolksyra.Api.Common.UserEvents;

public interface IUserEventPublisher
{
    Task Publish(Guid userId, string type, object? payload = null, CancellationToken cancellationToken = default);
}
