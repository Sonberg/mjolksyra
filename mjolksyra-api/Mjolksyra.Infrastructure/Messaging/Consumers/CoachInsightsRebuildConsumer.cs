using MassTransit;
using Microsoft.Extensions.Logging;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.UseCases.CompletedWorkouts.AnalyzeCompletedWorkoutMedia;

namespace Mjolksyra.Infrastructure.Messaging.Consumers;

public class CoachInsightsRebuildConsumer(
    ICoachInsightsRepository coachInsightsRepository,
    ITraineeRepository traineeRepository,
    ICompletedWorkoutRepository completedWorkoutRepository,
    ICoachInsightsAgent coachInsightsAgent,
    ILogger<CoachInsightsRebuildConsumer> logger)
    : IConsumer<CoachInsightsRebuildRequestedMessage>
{
    private const int MinimumAthletes = 3;

    public async Task Consume(ConsumeContext<CoachInsightsRebuildRequestedMessage> context)
    {
        var msg = context.Message;
        var ct = context.CancellationToken;

        var activeAthleteCount = await traineeRepository.CountActiveByCoachId(msg.CoachUserId, ct);
        if (activeAthleteCount < MinimumAthletes)
        {
            logger.LogInformation(
                "Skipping coach insights rebuild for coach {CoachUserId}: only {Count} active athletes (minimum {Min})",
                msg.CoachUserId, activeAthleteCount, MinimumAthletes);
            return;
        }

        var existing = await coachInsightsRepository.GetByCoachUserId(msg.CoachUserId, ct);
        var now = DateTimeOffset.UtcNow;

        var document = existing ?? new CoachInsights
        {
            Id = msg.CoachUserId,
            CreatedAt = now,
        };

        document.Status = InsightsStatus.Pending;
        await coachInsightsRepository.Upsert(document, ct);

        try
        {
            var activeTrainees = await traineeRepository.Get(msg.CoachUserId, ct);
            var activeTraineeIds = activeTrainees
                .Where(t => t.Status == TraineeStatus.Active)
                .Select(t => t.Id)
                .ToList();

            var dispatchers = activeTraineeIds
                .Select(traineeId => (IWorkoutAnalysisToolDispatcher)new WorkoutAnalysisToolDispatcher(
                    completedWorkoutRepository, traineeId))
                .ToList();

            var result = await coachInsightsAgent.GenerateAsync(new CoachInsightsGenerationInput
            {
                CoachUserId = msg.CoachUserId,
                LastRebuiltAt = existing?.LastRebuiltAt,
                ExistingStyleSummary = existing?.CoachingStyleSummary,
                TraineeDispatchers = dispatchers,
            }, ct);

            if (result.Success)
            {
                document.Status = InsightsStatus.Ready;
                document.LastRebuiltAt = DateTimeOffset.UtcNow;
                document.CoachingStyleSummary = result.CoachingStyleSummary;
                document.EffectivenessPatterns = result.EffectivenessPatterns
                    .Select(p => new CoachEffectivenessPattern { Pattern = p.Pattern, Detail = p.Detail })
                    .ToList();
            }
            else
            {
                document.Status = InsightsStatus.Failed;
            }

            await coachInsightsRepository.Upsert(document, ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to rebuild coach insights for coach {CoachUserId}", msg.CoachUserId);

            document.Status = InsightsStatus.Failed;
            await coachInsightsRepository.Upsert(document, ct);
        }
    }
}
