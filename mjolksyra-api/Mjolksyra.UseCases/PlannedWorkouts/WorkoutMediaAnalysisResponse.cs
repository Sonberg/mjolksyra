using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts;

public class WorkoutMediaAnalysisResponse
{
    public required string Summary { get; set; }

    public ICollection<string> KeyFindings { get; set; } = [];

    public ICollection<string> TechniqueRisks { get; set; } = [];

    public ICollection<string> CoachSuggestions { get; set; } = [];

    public DateTimeOffset CreatedAt { get; set; }

    public static WorkoutMediaAnalysisResponse From(WorkoutMediaAnalysis analysis, DateTimeOffset createdAt)
    {
        return new WorkoutMediaAnalysisResponse
        {
            Summary = analysis.Summary,
            KeyFindings = analysis.KeyFindings,
            TechniqueRisks = analysis.TechniqueRisks,
            CoachSuggestions = analysis.CoachSuggestions,
            CreatedAt = createdAt,
        };
    }

    public static WorkoutMediaAnalysisResponse From(WorkoutMediaAnalysisRecord analysis)
    {
        return new WorkoutMediaAnalysisResponse
        {
            Summary = analysis.Summary,
            KeyFindings = analysis.KeyFindings,
            TechniqueRisks = analysis.TechniqueRisks,
            CoachSuggestions = analysis.CoachSuggestions,
            CreatedAt = analysis.CreatedAt,
        };
    }
}
