using System.Text;
using MediatR;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Coaches.ConsumeCredits;
using OneOf;

namespace Mjolksyra.UseCases.Coaches.AnalyzeWorkoutText;

public class AnalyzeWorkoutTextCommandHandler(
    IMediator mediator,
    IWorkoutTextAnalysisGateway gateway)
    : IRequestHandler<AnalyzeWorkoutTextCommand, OneOf<AnalyzeWorkoutTextSuccess, AnalyzeWorkoutTextError>>
{
    public async Task<OneOf<AnalyzeWorkoutTextSuccess, AnalyzeWorkoutTextError>> Handle(
        AnalyzeWorkoutTextCommand request,
        CancellationToken cancellationToken)
    {
        if (request.PlannedWorkout is null)
            return new AnalyzeWorkoutTextError("Planned workout is required.");

        var workoutText = BuildWorkoutText(request.PlannedWorkout);
        var hasText = !string.IsNullOrWhiteSpace(workoutText);
        var hasMedia = request.PlannedWorkout.MediaUrls is { Count: > 0 };

        if (!hasText && !hasMedia)
            return new AnalyzeWorkoutTextError("Workout does not contain analyzable text or media.");

        var action = hasMedia ? CreditAction.AnalyzeWorkoutMedia : CreditAction.AnalyzeWorkoutText;
        var consumeResult = await mediator.Send(
            new ConsumeCreditsCommand(
                request.CoachUserId,
                action,
                request.ReferenceId ?? request.PlannedWorkout.Id.ToString()),
            cancellationToken);

        if (consumeResult.IsT1)
            return new AnalyzeWorkoutTextError(consumeResult.AsT1.Reason);

        WorkoutTextAnalysisResult analysis;
        try
        {
            analysis = await gateway.AnalyzeAsync(request.PlannedWorkout, workoutText, request.PlannedWorkout.MediaUrls, cancellationToken);
        }
        catch (Exception ex)
        {
            return new AnalyzeWorkoutTextError($"Workout text analysis failed: {ex.Message}");
        }

        var creditState = consumeResult.AsT0;
        return new AnalyzeWorkoutTextSuccess(
            analysis.Summary,
            analysis.KeyPoints,
            analysis.Recommendations,
            creditState.RemainingIncluded,
            creditState.RemainingPurchased);
    }

    private static string BuildWorkoutText(PlannedWorkout workout)
    {
        var sb = new StringBuilder();
        if (!string.IsNullOrWhiteSpace(workout.Name))
            sb.AppendLine($"Workout name: {workout.Name}");
        if (!string.IsNullOrWhiteSpace(workout.Note))
            sb.AppendLine($"Workout note: {workout.Note}");
        if (!string.IsNullOrWhiteSpace(workout.CompletionNote))
            sb.AppendLine($"Completion note: {workout.CompletionNote}");

        foreach (var exercise in workout.Exercises)
        {
            if (!string.IsNullOrWhiteSpace(exercise.Name))
                sb.AppendLine($"Exercise: {exercise.Name}");
            if (!string.IsNullOrWhiteSpace(exercise.Note))
                sb.AppendLine($"  Note: {exercise.Note}");

            var sets = exercise.Prescription?.Sets;
            if (sets is { Count: > 0 })
            {
                var index = 1;
                foreach (var set in sets)
                {
                    var target = FormatSetSide("Target", set.Target?.Reps, set.Target?.WeightKg, set.Target?.DurationSeconds, set.Target?.DistanceMeters);
                    var actual = FormatSetSide("Actual", set.Actual?.Reps, set.Actual?.WeightKg, set.Actual?.DurationSeconds, set.Actual?.DistanceMeters);
                    if (target is not null || actual is not null)
                    {
                        var parts = new[] { target, actual }.Where(x => x is not null);
                        sb.AppendLine($"  Set {index} — {string.Join(" | ", parts)}");
                    }
                    index++;
                }
            }
        }

        return sb.ToString().Trim();
    }

    private static string? FormatSetSide(string label, int? reps, double? weightKg, int? durationSeconds, double? distanceMeters)
    {
        var parts = new List<string>();
        if (reps.HasValue) parts.Add($"{reps} reps");
        if (weightKg.HasValue) parts.Add($"{weightKg}kg");
        if (durationSeconds.HasValue) parts.Add($"{durationSeconds}s");
        if (distanceMeters.HasValue) parts.Add($"{distanceMeters}m");
        return parts.Count > 0 ? $"{label}: {string.Join(" @ ", parts)}" : null;
    }
}

