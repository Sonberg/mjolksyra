namespace Mjolksyra.Domain.Database.Models;

public class Trainee
{
    public Guid Id { get; set; }

    public Guid CoachUserId { get; set; }

    public Guid AthleteUserId { get; set; }
    
    public Guid? TraineeInvitationId { get; set; }

    public required TraineeStatus Status { get; set; }

    public TraineeCost Cost { get; set; } = new();

    public ICollection<TraineeTransaction> Transactions { get; set; } = [];

    public string? StripeSubscriptionId { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? DeletedAt { get; set; }
}