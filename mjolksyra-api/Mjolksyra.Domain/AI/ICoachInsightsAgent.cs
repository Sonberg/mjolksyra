namespace Mjolksyra.Domain.AI;

public interface ICoachInsightsAgent
{
    Task<CoachInsightsGenerationResult> GenerateAsync(CoachInsightsGenerationInput input, CancellationToken ct);
}

public class CoachInsightsGenerationInput
{
    public required Guid CoachUserId { get; set; }

    public DateTimeOffset? LastRebuiltAt { get; set; }

    /// <summary>Existing coach insights summary to merge with new delta.</summary>
    public string? ExistingStyleSummary { get; set; }

    public required ICollection<IWorkoutAnalysisToolDispatcher> TraineeDispatchers { get; set; }
}

public class CoachInsightsGenerationResult
{
    public bool Success { get; set; }

    public string CoachingStyleSummary { get; set; } = string.Empty;

    public ICollection<CoachEffectivenessPatternResult> EffectivenessPatterns { get; set; } = [];
}

public class CoachEffectivenessPatternResult
{
    public string Pattern { get; set; } = string.Empty;

    public string Detail { get; set; } = string.Empty;
}
