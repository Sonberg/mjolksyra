namespace Mjolksyra.Domain.Database.Models;

public class WorkoutMediaAnalysisRecord
{
    public Guid Id { get; set; }

    public Guid TraineeId { get; set; }

    public Guid PlannedWorkoutId { get; set; }

    public Guid RequestedByUserId { get; set; }

    public string Text { get; set; } = string.Empty;

    public ICollection<string> MediaUrls { get; set; } = [];

    public required string Summary { get; set; }

    public ICollection<string> KeyFindings { get; set; } = [];

    public ICollection<string> TechniqueRisks { get; set; } = [];

    public ICollection<string> CoachSuggestions { get; set; } = [];

    public ICollection<WorkoutAnalysisToolCall> ToolCalls { get; set; } = [];

    public DateTimeOffset CreatedAt { get; set; }
}

public class WorkoutAnalysisToolCall
{
    public string Tool { get; set; } = string.Empty;

    public string Arguments { get; set; } = string.Empty;

    public string Result { get; set; } = string.Empty;

    public DateTimeOffset CalledAt { get; set; }
}
