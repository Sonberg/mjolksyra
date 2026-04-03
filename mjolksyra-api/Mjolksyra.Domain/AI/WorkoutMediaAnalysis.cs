namespace Mjolksyra.Domain.AI;

public class WorkoutMediaAnalysisInput
{
    public required string Text { get; set; }

    public ICollection<string> MediaUrls { get; set; } = [];
}

public class WorkoutMediaAnalysis
{
    public required string Summary { get; set; }

    public ICollection<string> KeyFindings { get; set; } = [];

    public ICollection<string> TechniqueRisks { get; set; } = [];

    public ICollection<string> CoachSuggestions { get; set; } = [];
}
