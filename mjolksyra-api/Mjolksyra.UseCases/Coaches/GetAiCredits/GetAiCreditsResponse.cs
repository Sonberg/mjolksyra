namespace Mjolksyra.UseCases.Coaches.GetAiCredits;

public class GetAiCreditsResponse
{
    public required int IncludedRemaining { get; set; }
    public required int PurchasedRemaining { get; set; }
    public required int TotalRemaining { get; set; }
    public DateTimeOffset? LastResetAt { get; set; }
}
