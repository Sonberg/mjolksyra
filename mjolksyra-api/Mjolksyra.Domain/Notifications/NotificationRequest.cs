namespace Mjolksyra.Domain.Notifications;

public record NotificationRequest
{
    public Guid UserId { get; init; }
    public required string Type { get; init; }
    public required string Title { get; init; }
    public string? Body { get; init; }
    public string? Href { get; init; }
    public Guid? CompletedWorkoutId { get; init; }
}
