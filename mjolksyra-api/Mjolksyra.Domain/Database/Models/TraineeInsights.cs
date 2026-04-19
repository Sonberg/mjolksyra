using Mjolksyra.Domain.Database.Common;
using MongoDB.Bson.Serialization.Attributes;

namespace Mjolksyra.Domain.Database.Models;

[BsonIgnoreExtraElements]
public class TraineeInsights : IDocument
{
    /// <summary>Set to TraineeId — one document per trainee.</summary>
    public Guid Id { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public string Status { get; set; } = InsightsStatus.Pending;

    public DateTimeOffset? GeneratedAt { get; set; }

    public DateTimeOffset? RebuildRequestedAt { get; set; }

    public bool VisibleToAthlete { get; set; }

    public DateTimeOffset? SignificantChangeDetectedAt { get; set; }

    public InsightsAthleteProfile? AthleteProfile { get; set; }

    public InsightsFatigueRisk? FatigueRisk { get; set; }

    public InsightsProgressionSummary? ProgressionSummary { get; set; }

    public ICollection<InsightsStrength> Strengths { get; set; } = [];

    public ICollection<InsightsWeakness> Weaknesses { get; set; } = [];

    public ICollection<InsightsRecommendation> Recommendations { get; set; } = [];
}

public static class InsightsStatus
{
    public const string Pending = "pending";
    public const string Ready = "ready";
    public const string Failed = "failed";
}

public class InsightsAthleteProfile
{
    public string Summary { get; set; } = string.Empty;

    public string TrainingAge { get; set; } = InsightsTrainingAge.Beginner;
}

public static class InsightsTrainingAge
{
    public const string Beginner = "beginner";
    public const string Intermediate = "intermediate";
    public const string Advanced = "advanced";
}

public class InsightsFatigueRisk
{
    public string Level { get; set; } = InsightsFatigueLevel.Low;

    public int Score { get; set; }

    public string Explanation { get; set; } = string.Empty;
}

public static class InsightsFatigueLevel
{
    public const string Low = "low";
    public const string Medium = "medium";
    public const string High = "high";
}

public class InsightsProgressionSummary
{
    public string Overall { get; set; } = InsightsProgressionTrend.Improving;

    public string Summary { get; set; } = string.Empty;

    public ICollection<InsightsExerciseTrend> Exercises { get; set; } = [];
}

public class InsightsExerciseTrend
{
    public string Name { get; set; } = string.Empty;

    public string Trend { get; set; } = InsightsProgressionTrend.Improving;

    public string Detail { get; set; } = string.Empty;
}

public static class InsightsProgressionTrend
{
    public const string Improving = "improving";
    public const string Plateauing = "plateauing";
    public const string Declining = "declining";
}

public class InsightsStrength
{
    public string Label { get; set; } = string.Empty;

    public string Detail { get; set; } = string.Empty;

    public string? ExerciseRef { get; set; }
}

public class InsightsWeakness
{
    public string Label { get; set; } = string.Empty;

    public string Detail { get; set; } = string.Empty;

    public string? ExerciseRef { get; set; }
}

public class InsightsRecommendation
{
    public string Label { get; set; } = string.Empty;

    public string Detail { get; set; } = string.Empty;

    public string Priority { get; set; } = InsightsPriority.Medium;
}

public static class InsightsPriority
{
    public const string High = "high";
    public const string Medium = "medium";
    public const string Low = "low";
}
