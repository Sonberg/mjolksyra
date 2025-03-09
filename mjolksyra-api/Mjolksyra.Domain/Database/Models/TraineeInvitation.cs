namespace Mjolksyra.Domain.Database.Models;

public class TraineeInvitation
{
    public Guid Id { get; set; }

    public Guid CoachUserId { get; set; }

    public string? GivenName { get; set; }

    public string? FamilyName { get; set; }

    public required string Email { get; set; }

    public DateTimeOffset? AcceptedAt { get; set; }

    public DateTimeOffset? RejectedAt { get; set; }
    
    public DateTimeOffset CreatedAt { get; set; }
}