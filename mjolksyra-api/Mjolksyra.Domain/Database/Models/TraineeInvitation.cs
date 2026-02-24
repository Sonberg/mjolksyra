namespace Mjolksyra.Domain.Database.Models;

public class TraineeInvitation
{
    public Guid Id { get; set; }

    public Guid CoachUserId { get; set; }

    public required Email Email { get; set; }

    public int? MonthlyPriceAmount { get; set; }

    public DateTimeOffset? AcceptedAt { get; set; }

    public DateTimeOffset? RejectedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}
