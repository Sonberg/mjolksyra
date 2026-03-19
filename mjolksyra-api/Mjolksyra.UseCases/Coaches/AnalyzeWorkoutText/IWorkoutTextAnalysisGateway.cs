using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Coaches.AnalyzeWorkoutText;

public interface IWorkoutTextAnalysisGateway
{
    Task<WorkoutTextAnalysisResult> AnalyzeAsync(
        PlannedWorkout workout,
        string workoutText,
        ICollection<string>? mediaUrls,
        CancellationToken cancellationToken);
}

public record WorkoutTextAnalysisResult(
    string Summary,
    ICollection<string> KeyPoints,
    ICollection<string> Recommendations);

