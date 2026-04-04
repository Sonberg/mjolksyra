namespace Mjolksyra.UseCases.Coaches.GetCredits;

public class GetCreditsResponse
{
    public int IncludedRemaining { get; set; }

    public int PurchasedRemaining { get; set; }

    public int TotalRemaining { get; set; }

    public DateTimeOffset? LastResetAt { get; set; }
}
