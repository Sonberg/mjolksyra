namespace Mjolksyra.Domain.Database.Models;

public class FeedbackReport
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public string? Email { get; set; }

    public required string Message { get; set; }

    public string? PageUrl { get; set; }

    public required string Status { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
