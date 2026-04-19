using MassTransit;
using MediatR;
using Microsoft.Extensions.Logging;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.Notifications;
using Mjolksyra.UseCases.CompletedWorkouts.AnalyzeCompletedWorkoutMedia;
using Mjolksyra.UseCases.Coaches.ReleaseCreditsReservation;
using Mjolksyra.UseCases.Coaches.SettleCreditsReservation;

namespace Mjolksyra.Infrastructure.Messaging.Consumers;

public class TraineeInsightsRebuildConsumer(
    ITraineeInsightsRepository traineeInsightsRepository,
    ICompletedWorkoutRepository completedWorkoutRepository,
    ITraineeInsightsAgent traineeInsightsAgent,
    INotificationService notificationService,
    IMediator mediator,
    ILogger<TraineeInsightsRebuildConsumer> logger)
    : IConsumer<TraineeInsightsRebuildRequestedMessage>
{
    private static readonly TimeSpan DebounceWindow = TimeSpan.FromMinutes(30);
    private const int MinimumWorkouts = 3;

    public async Task Consume(ConsumeContext<TraineeInsightsRebuildRequestedMessage> context)
    {
        var msg = context.Message;
        var ct = context.CancellationToken;

        var existing = await traineeInsightsRepository.GetByTraineeId(msg.TraineeId, ct);

        // Debounce: for auto-rebuilds, skip if another rebuild was requested more recently
        if (!msg.IsManual && existing?.RebuildRequestedAt is { } lastRequested)
        {
            if (lastRequested > msg.RequestedAt)
            {
                logger.LogInformation(
                    "Skipping auto-rebuild for trainee {TraineeId}: a newer request exists at {LastRequested}",
                    msg.TraineeId, lastRequested);
                return;
            }

            if (DateTimeOffset.UtcNow - lastRequested < DebounceWindow && lastRequested != msg.RequestedAt)
            {
                logger.LogInformation(
                    "Debouncing auto-rebuild for trainee {TraineeId}: within {Window} window",
                    msg.TraineeId, DebounceWindow);
                return;
            }
        }

        // Minimum workout guard
        var completedCount = await completedWorkoutRepository.CountCompletedByTraineeId(msg.TraineeId, ct);
        if (completedCount < MinimumWorkouts)
        {
            logger.LogInformation(
                "Skipping insights rebuild for trainee {TraineeId}: only {Count} completed workouts (minimum {Min})",
                msg.TraineeId, completedCount, MinimumWorkouts);
            return;
        }

        var now = DateTimeOffset.UtcNow;
        var document = existing ?? new TraineeInsights
        {
            Id = msg.TraineeId,
            CreatedAt = now,
        };

        document.Status = InsightsStatus.Pending;
        document.RebuildRequestedAt = msg.RequestedAt;
        await traineeInsightsRepository.Upsert(document, ct);

        try
        {
            var dispatcher = new WorkoutAnalysisToolDispatcher(completedWorkoutRepository, msg.TraineeId);
            var result = await traineeInsightsAgent.GenerateAsync(new TraineeInsightsGenerationInput
            {
                TraineeId = msg.TraineeId,
                ToolDispatcher = dispatcher,
            }, ct);

            // Detect change before mutating document (document == existing when existing != null)
            var changeDescription = !msg.IsManual && result.Success
                ? DetectSignificantChange(existing, result)
                : null;
            var alreadyPending = existing?.SignificantChangeDetectedAt != null;

            if (result.Success)
            {
                document.Status = InsightsStatus.Ready;
                document.GeneratedAt = DateTimeOffset.UtcNow;
                document.AthleteProfile = result.AthleteProfile is null ? null : new InsightsAthleteProfile
                {
                    Summary = result.AthleteProfile.Summary,
                    TrainingAge = result.AthleteProfile.TrainingAge,
                };
                document.FatigueRisk = result.FatigueRisk is null ? null : new InsightsFatigueRisk
                {
                    Level = result.FatigueRisk.Level,
                    Score = result.FatigueRisk.Score,
                    Explanation = result.FatigueRisk.Explanation,
                };
                document.ProgressionSummary = result.ProgressionSummary is null ? null : new InsightsProgressionSummary
                {
                    Overall = result.ProgressionSummary.Overall,
                    Summary = result.ProgressionSummary.Summary,
                    Exercises = result.ProgressionSummary.Exercises
                        .Select(e => new InsightsExerciseTrend { Name = e.Name, Trend = e.Trend, Detail = e.Detail })
                        .ToList(),
                };
                document.Strengths = result.Strengths
                    .Select(s => new InsightsStrength { Label = s.Label, Detail = s.Detail, ExerciseRef = s.ExerciseRef })
                    .ToList();
                document.Weaknesses = result.Weaknesses
                    .Select(w => new InsightsWeakness { Label = w.Label, Detail = w.Detail, ExerciseRef = w.ExerciseRef })
                    .ToList();
                document.Recommendations = result.Recommendations
                    .Select(r => new InsightsRecommendation { Label = r.Label, Detail = r.Detail, Priority = r.Priority })
                    .ToList();

                if (changeDescription != null)
                {
                    document.SignificantChangeDetectedAt = DateTimeOffset.UtcNow;

                    if (!alreadyPending)
                    {
                        await notificationService.Notify(new NotificationRequest
                        {
                            UserId = msg.CoachUserId,
                            Type = "insights.significant_change",
                            Title = "New insight alert",
                            Body = $"{msg.AthleteName}: {changeDescription}",
                            Href = $"/app/coach/athletes/{msg.TraineeId}/insights",
                        }, ct);
                    }
                }
            }
            else
            {
                document.Status = InsightsStatus.Failed;
            }

            await traineeInsightsRepository.Upsert(document, ct);

            if (msg.IsManual && result.Success)
            {
                await mediator.Send(new SettleCreditsReservationCommand(
                    msg.CoachUserId,
                    msg.IncludedReserved,
                    msg.PurchasedReserved,
                    CreditAction.RebuildTraineeInsights,
                    msg.TraineeId.ToString()), ct);
            }
            else if (msg.IsManual && !result.Success)
            {
                await mediator.Send(new ReleaseCreditsReservationCommand(
                    msg.CoachUserId,
                    msg.IncludedReserved,
                    msg.PurchasedReserved,
                    msg.TraineeId.ToString()), ct);
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to rebuild insights for trainee {TraineeId}", msg.TraineeId);

            document.Status = InsightsStatus.Failed;
            await traineeInsightsRepository.Upsert(document, ct);

            if (msg.IsManual)
            {
                await mediator.Send(new ReleaseCreditsReservationCommand(
                    msg.CoachUserId,
                    msg.IncludedReserved,
                    msg.PurchasedReserved,
                    msg.TraineeId.ToString()), ct);
            }
        }
    }

    private static string? DetectSignificantChange(TraineeInsights? before, TraineeInsightsGenerationResult after)
    {
        if (before?.FatigueRisk?.Level is { } prevFatigue &&
            after.FatigueRisk?.Level is { } newFatigue &&
            prevFatigue != newFatigue)
            return $"Fatigue risk changed to {newFatigue}";

        if (before?.ProgressionSummary?.Overall is { } prevTrend &&
            after.ProgressionSummary?.Overall is { } newTrend &&
            prevTrend != newTrend)
            return $"Progression trend changed to {newTrend}";

        var prevHighLabels = before?.Recommendations
            .Where(r => r.Priority == InsightsPriority.High)
            .Select(r => r.Label)
            .ToHashSet() ?? [];
        var newHighRec = after.Recommendations
            .FirstOrDefault(r => r.Priority == InsightsPriority.High && !prevHighLabels.Contains(r.Label));
        if (newHighRec != null)
            return $"New high-priority recommendation: {newHighRec.Label}";

        return null;
    }
}
