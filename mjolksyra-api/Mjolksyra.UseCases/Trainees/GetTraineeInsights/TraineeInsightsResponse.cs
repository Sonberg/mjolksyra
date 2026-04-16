using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Trainees.GetTraineeInsights;

public record TraineeInsightsResponse(
    string Status,
    DateTimeOffset? GeneratedAt,
    bool VisibleToAthlete,
    TraineeInsightsAthleteProfileResponse? AthleteProfile,
    TraineeInsightsFatigueRiskResponse? FatigueRisk,
    TraineeInsightsProgressionSummaryResponse? ProgressionSummary,
    ICollection<TraineeInsightsStrengthResponse> Strengths,
    ICollection<TraineeInsightsWeaknessResponse> Weaknesses,
    ICollection<TraineeInsightsRecommendationResponse> Recommendations)
{
    public static TraineeInsightsResponse From(TraineeInsights insights)
    {
        return new TraineeInsightsResponse(
            Status: insights.Status,
            GeneratedAt: insights.GeneratedAt,
            VisibleToAthlete: insights.VisibleToAthlete,
            AthleteProfile: insights.AthleteProfile is null ? null : new TraineeInsightsAthleteProfileResponse(
                insights.AthleteProfile.Summary,
                insights.AthleteProfile.TrainingAge),
            FatigueRisk: insights.FatigueRisk is null ? null : new TraineeInsightsFatigueRiskResponse(
                insights.FatigueRisk.Level,
                insights.FatigueRisk.Score,
                insights.FatigueRisk.Explanation),
            ProgressionSummary: insights.ProgressionSummary is null ? null : new TraineeInsightsProgressionSummaryResponse(
                insights.ProgressionSummary.Overall,
                insights.ProgressionSummary.Summary,
                insights.ProgressionSummary.Exercises
                    .Select(e => new TraineeInsightsExerciseTrendResponse(e.Name, e.Trend, e.Detail))
                    .ToList()),
            Strengths: insights.Strengths
                .Select(s => new TraineeInsightsStrengthResponse(s.Label, s.Detail, s.ExerciseRef))
                .ToList(),
            Weaknesses: insights.Weaknesses
                .Select(w => new TraineeInsightsWeaknessResponse(w.Label, w.Detail, w.ExerciseRef))
                .ToList(),
            Recommendations: insights.Recommendations
                .Select(r => new TraineeInsightsRecommendationResponse(r.Label, r.Detail, r.Priority))
                .ToList());
    }
}

public record TraineeInsightsAthleteProfileResponse(string Summary, string TrainingAge);

public record TraineeInsightsFatigueRiskResponse(string Level, int Score, string Explanation);

public record TraineeInsightsProgressionSummaryResponse(
    string Overall,
    string Summary,
    ICollection<TraineeInsightsExerciseTrendResponse> Exercises);

public record TraineeInsightsExerciseTrendResponse(string Name, string Trend, string Detail);

public record TraineeInsightsStrengthResponse(string Label, string Detail, string? ExerciseRef);

public record TraineeInsightsWeaknessResponse(string Label, string Detail, string? ExerciseRef);

public record TraineeInsightsRecommendationResponse(string Label, string Detail, string Priority);
