namespace Mjolksyra.Domain.AI;

public interface ITraineeInsightsAgent
{
    Task<TraineeInsightsGenerationResult> GenerateAsync(TraineeInsightsGenerationInput input, CancellationToken ct);
}

public class TraineeInsightsGenerationInput
{
    public required Guid TraineeId { get; set; }

    public required IWorkoutAnalysisToolDispatcher ToolDispatcher { get; set; }
}

public class TraineeInsightsGenerationResult
{
    public bool Success { get; set; }

    public TraineeInsightsAthleteProfileResult? AthleteProfile { get; set; }

    public TraineeInsightsFatigueRiskResult? FatigueRisk { get; set; }

    public TraineeInsightsProgressionSummaryResult? ProgressionSummary { get; set; }

    public ICollection<TraineeInsightsStrengthResult> Strengths { get; set; } = [];

    public ICollection<TraineeInsightsWeaknessResult> Weaknesses { get; set; } = [];

    public ICollection<TraineeInsightsRecommendationResult> Recommendations { get; set; } = [];
}

public class TraineeInsightsAthleteProfileResult
{
    public string Summary { get; set; } = string.Empty;

    public string TrainingAge { get; set; } = string.Empty;
}

public class TraineeInsightsFatigueRiskResult
{
    public string Level { get; set; } = string.Empty;

    public int Score { get; set; }

    public string Explanation { get; set; } = string.Empty;
}

public class TraineeInsightsProgressionSummaryResult
{
    public string Overall { get; set; } = string.Empty;

    public string Summary { get; set; } = string.Empty;

    public ICollection<TraineeInsightsExerciseTrendResult> Exercises { get; set; } = [];
}

public class TraineeInsightsExerciseTrendResult
{
    public string Name { get; set; } = string.Empty;

    public string Trend { get; set; } = string.Empty;

    public string Detail { get; set; } = string.Empty;
}

public class TraineeInsightsStrengthResult
{
    public string Label { get; set; } = string.Empty;

    public string Detail { get; set; } = string.Empty;

    public string? ExerciseRef { get; set; }
}

public class TraineeInsightsWeaknessResult
{
    public string Label { get; set; } = string.Empty;

    public string Detail { get; set; } = string.Empty;

    public string? ExerciseRef { get; set; }
}

public class TraineeInsightsRecommendationResult
{
    public string Label { get; set; } = string.Empty;

    public string Detail { get; set; } = string.Empty;

    public string Priority { get; set; } = string.Empty;
}
