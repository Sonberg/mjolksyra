using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.CompletedWorkouts;

public class CompletedWorkoutMediaAnalysisResponse
{
    public required string Summary { get; set; }

    public ICollection<string> KeyFindings { get; set; } = [];

    public ICollection<string> TechniqueRisks { get; set; } = [];

    public ICollection<string> CoachSuggestions { get; set; } = [];

    public DateTimeOffset CreatedAt { get; set; }

    public static CompletedWorkoutMediaAnalysisResponse From(WorkoutMediaAnalysis analysis, DateTimeOffset createdAt)
    {
        return new CompletedWorkoutMediaAnalysisResponse
        {
            Summary = analysis.Summary,
            KeyFindings = analysis.KeyFindings,
            TechniqueRisks = analysis.TechniqueRisks,
            CoachSuggestions = analysis.CoachSuggestions,
            CreatedAt = createdAt,
        };
    }

    public static CompletedWorkoutMediaAnalysisResponse From(WorkoutMediaAnalysisRecord analysis)
    {
        return new CompletedWorkoutMediaAnalysisResponse
        {
            Summary = analysis.Summary,
            KeyFindings = analysis.KeyFindings,
            TechniqueRisks = analysis.TechniqueRisks,
            CoachSuggestions = analysis.CoachSuggestions,
            CreatedAt = analysis.CreatedAt,
        };
    }
}
