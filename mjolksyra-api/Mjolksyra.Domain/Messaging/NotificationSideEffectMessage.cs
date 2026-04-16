namespace Mjolksyra.Domain.Messaging;

public class NotificationSideEffectMessage
{
    public required Guid UserId { get; set; }

    public required string Type { get; set; }

    public required string Title { get; set; }

    public string? Body { get; set; }

    public string? Href { get; set; }

    public Guid? CompletedWorkoutId { get; set; }
}

public class NotificationSideEffectManyMessage
{
    public required ICollection<Guid> UserIds { get; set; }

    public required string Type { get; set; }

    public required string Title { get; set; }

    public string? Body { get; set; }

    public string? Href { get; set; }

    public Guid? CompletedWorkoutId { get; set; }
}
