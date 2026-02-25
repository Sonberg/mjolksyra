namespace Mjolksyra.Domain.Database.Models;

public class Notification
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public required string Type { get; set; }

    public required string Title { get; set; }

    public string? Body { get; set; }

    public string? Href { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? ReadAt { get; set; }
}
