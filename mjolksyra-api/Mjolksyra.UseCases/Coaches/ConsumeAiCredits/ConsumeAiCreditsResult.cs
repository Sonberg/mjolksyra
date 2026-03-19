namespace Mjolksyra.UseCases.Coaches.ConsumeAiCredits;

public record ConsumeAiCreditsSuccess(int RemainingIncluded, int RemainingPurchased);

public record ConsumeAiCreditsError(string Reason);
