namespace Mjolksyra.UseCases.Coaches.ReserveCredits;

public record ReserveCreditsSuccess(int IncludedReserved, int PurchasedReserved, int TotalCost);

public record ReserveCreditsError(string Reason);
