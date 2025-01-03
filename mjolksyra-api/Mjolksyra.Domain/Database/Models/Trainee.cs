namespace Mjolksyra.Domain.Database.Models;

public class Trainee
{
    public Guid CoachUserId { get; set; }

    public Guid AthleteUserId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }
}