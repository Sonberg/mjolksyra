using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.Trainees;

internal static class TraineeInsightsRecovery
{
    internal static readonly TimeSpan PendingExpiry = TimeSpan.FromMinutes(20);

    internal static bool IsExpiredPending(TraineeInsights? insights, DateTimeOffset now)
    {
        return insights?.Status == InsightsStatus.Pending
            && insights.RebuildRequestedAt is { } requestedAt
            && requestedAt <= now - PendingExpiry;
    }

    internal static bool HasRenderableContent(TraineeInsights? insights)
    {
        return insights is not null && (
            insights.AthleteProfile is not null ||
            insights.FatigueRisk is not null ||
            insights.ProgressionSummary is not null ||
            insights.Strengths.Count > 0 ||
            insights.Weaknesses.Count > 0 ||
            insights.Recommendations.Count > 0);
    }

    internal static string GetRecoveredStatus(TraineeInsights insights)
    {
        return HasRenderableContent(insights)
            ? InsightsStatus.Ready
            : InsightsStatus.Failed;
    }

    internal static bool RecoverExpiredPending(TraineeInsights? insights, DateTimeOffset now)
    {
        if (!IsExpiredPending(insights, now) || insights is null)
        {
            return false;
        }

        insights.Status = GetRecoveredStatus(insights);
        insights.RebuildRequestedAt = null;
        return true;
    }
}
