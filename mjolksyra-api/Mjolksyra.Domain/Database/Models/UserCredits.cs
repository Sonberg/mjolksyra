namespace Mjolksyra.Domain.Database.Models;

public class UserCredits
{
    public Guid Id { get; set; }

    public Guid CoachUserId { get; set; }

    public int IncludedRemaining { get; set; }

    public int PurchasedRemaining { get; set; }

    public int IncludedReserved { get; set; } = 0;

    public int PurchasedReserved { get; set; } = 0;

    public DateTimeOffset? LastResetAt { get; set; }

    public int Version { get; set; }
}
