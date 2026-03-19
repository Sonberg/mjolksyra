namespace Mjolksyra.UseCases.Coaches.ConsumeCredits;

public record ConsumeCreditsSuccess(int RemainingIncluded, int RemainingPurchased);

public record ConsumeCreditsError(string Reason);
