using Mjolksyra.Domain.AI;

namespace Mjolksyra.UseCases.PlannedWorkouts;

public class WorkoutMediaAnalysisResponse
{
    public required string Summary { get; set; }

    public ICollection<string> KeyFindings { get; set; } = [];

    public ICollection<string> TechniqueRisks { get; set; } = [];

    public ICollection<string> CoachSuggestions { get; set; } = [];

    public static WorkoutMediaAnalysisResponse From(WorkoutMediaAnalysis analysis)
    {
        return new WorkoutMediaAnalysisResponse
        {
            Summary = analysis.Summary,
            KeyFindings = analysis.KeyFindings,
            TechniqueRisks = analysis.TechniqueRisks,
            CoachSuggestions = analysis.CoachSuggestions,
        };
    }
}
