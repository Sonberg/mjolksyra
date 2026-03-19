namespace Mjolksyra.UseCases.Coaches.AnalyzeWorkoutText;

public record AnalyzeWorkoutTextSuccess(
    string Summary,
    ICollection<string> KeyPoints,
    ICollection<string> Recommendations,
    int RemainingIncluded,
    int RemainingPurchased);

public record AnalyzeWorkoutTextError(string Reason);

