using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Coaches.ConsumeCredits;
using OneOf;
using CompletedExercise = Mjolksyra.Domain.Database.Models.CompletedExercise;

namespace Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

public class AnalyzeWorkoutMediaCommandHandler(
    IMediator mediator,
    IPlannedWorkoutRepository plannedWorkoutRepository,
    ICompletedWorkoutRepository completedWorkoutRepository,
    IPlannedWorkoutChatMessageRepository plannedWorkoutChatMessageRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext,
    IWorkoutMediaAnalysisRepository workoutMediaAnalysisRepository,
    IWorkoutMediaAnalysisAgent workoutMediaAnalysisAgent) : IRequestHandler<AnalyzeWorkoutMediaCommand, OneOf<WorkoutMediaAnalysisResponse, AnalyzeWorkoutMediaForbidden, AnalyzeWorkoutMediaInsufficientCredits>>
{
    public async Task<OneOf<WorkoutMediaAnalysisResponse, AnalyzeWorkoutMediaForbidden, AnalyzeWorkoutMediaInsufficientCredits>> Handle(AnalyzeWorkoutMediaCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return new AnalyzeWorkoutMediaForbidden();
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return new AnalyzeWorkoutMediaForbidden();
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return new AnalyzeWorkoutMediaForbidden();
        }

        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (workout is null || workout.TraineeId != request.TraineeId)
        {
            return new AnalyzeWorkoutMediaForbidden();
        }

        var consumeResult = await mediator.Send(
            new ConsumeCreditsCommand(
                userId,
                CreditAction.AnalyzeWorkoutMedia,
                request.PlannedWorkoutId.ToString()),
            cancellationToken);

        if (consumeResult.IsT1)
        {
            return new AnalyzeWorkoutMediaInsufficientCredits(consumeResult.AsT1.Reason);
        }

        var chatMessages = await plannedWorkoutChatMessageRepository.GetByWorkoutId(
            request.TraineeId,
            request.PlannedWorkoutId,
            cancellationToken);

        // Load session exercises (which carry actual logged data) for AI context
        var session = await completedWorkoutRepository.GetByPlannedWorkoutId(request.PlannedWorkoutId, cancellationToken);
        var sessionExercises = session?.Exercises ?? (ICollection<CompletedExercise>)[];

        var analysisText = request.Analysis.Text.Trim();

        var loggedRepEvidence = BuildLoggedRepEvidence(sessionExercises);
        if (!string.IsNullOrWhiteSpace(loggedRepEvidence))
        {
            analysisText =
                $"{analysisText}\n\nAuthoritative workout log rep counts:\n{loggedRepEvidence}\nUse these logged rep counts as source of truth. Do not claim a different exact rep count from media alone.";
        }

        if (chatMessages.Count > 0)
        {
            var chatHistory = string.Join('\n', chatMessages.Select(message =>
                $"- [{message.Role}] {(string.IsNullOrWhiteSpace(message.Message) ? "(no text)" : message.Message)}"));
            analysisText = $"{analysisText}\n\nWorkout chat history:\n{chatHistory}";
        }

        var allMedia = chatMessages
            .SelectMany(x => x.Media)
            .Where(m => !string.IsNullOrWhiteSpace(m.CompressedUrl ?? m.RawUrl))
            .DistinctBy(m => m.CompressedUrl ?? m.RawUrl)
            .ToList();

        var imageUrls = allMedia
            .Where(m => m.Type == PlannedWorkoutMediaType.Image)
            .Select(m => m.CompressedUrl ?? m.RawUrl!)
            .ToList();

        var videoUrls = allMedia
            .Where(m => m.Type == PlannedWorkoutMediaType.Video)
            .Select(m => m.CompressedUrl ?? m.RawUrl!)
            .ToList();

        var dispatcher = new LoggingWorkoutAnalysisToolDispatcher(
            new WorkoutAnalysisToolDispatcher(completedWorkoutRepository, request.TraineeId));

        var analysis = await workoutMediaAnalysisAgent.AnalyzeAsync(new WorkoutMediaAnalysisInput
        {
            Text = analysisText,
            ImageUrls = imageUrls,
            VideoUrls = videoUrls,
            ToolDispatcher = dispatcher,
            Exercises = sessionExercises
                .Select(exercise => new WorkoutExerciseAnalysisInput
                {
                    Name = exercise.Name,
                    Sets = (exercise.Prescription?.Sets ?? [])
                        .Select((set, index) => new WorkoutExerciseSetAnalysisInput
                        {
                            SetNumber = index + 1,
                            TargetReps = set.Target?.Reps,
                            TargetWeightKg = set.Target?.WeightKg,
                            TargetDurationSeconds = set.Target?.DurationSeconds,
                            TargetDistanceMeters = set.Target?.DistanceMeters,
                            TargetNote = set.Target?.Note,
                            ActualReps = set.Actual?.Reps,
                            ActualWeightKg = set.Actual?.WeightKg,
                            ActualDurationSeconds = set.Actual?.DurationSeconds,
                            ActualDistanceMeters = set.Actual?.DistanceMeters,
                            ActualNote = set.Actual?.Note,
                            ActualIsDone = set.Actual?.IsDone,
                        })
                        .ToList(),
                })
                .ToList(),
        }, cancellationToken);

        var createdAt = DateTimeOffset.UtcNow;
        await workoutMediaAnalysisRepository.Create(new WorkoutMediaAnalysisRecord
        {
            Id = Guid.NewGuid(),
            TraineeId = request.TraineeId,
            PlannedWorkoutId = request.PlannedWorkoutId,
            RequestedByUserId = userId,
            Text = request.Analysis.Text.Trim(),
            MediaUrls = [..imageUrls, ..videoUrls],
            Summary = analysis.Summary,
            KeyFindings = analysis.KeyFindings,
            TechniqueRisks = analysis.TechniqueRisks,
            CoachSuggestions = analysis.CoachSuggestions,
            ToolCalls = dispatcher.Calls.ToList(),
            CreatedAt = createdAt,
        }, cancellationToken);

        return WorkoutMediaAnalysisResponse.From(analysis, createdAt);
    }

    private static string BuildLoggedRepEvidence(ICollection<CompletedExercise> exercises)
    {
        var lines = exercises
            .Select(exercise =>
            {
                var loggedSetReps = (exercise.Prescription?.Sets ?? [])
                    .Select((set, index) => new { SetNumber = index + 1, set.Actual?.Reps })
                    .Where(x => x.Reps.HasValue)
                    .Select(x => new { x.SetNumber, Reps = x.Reps!.Value })
                    .ToList();

                if (loggedSetReps.Count == 0)
                {
                    return null;
                }

                var totalLoggedReps = loggedSetReps.Sum(x => x.Reps);
                var perSet = string.Join(", ", loggedSetReps.Select(x => $"set {x.SetNumber}={x.Reps}"));
                return $"- {exercise.Name}: totalLoggedReps={totalLoggedReps}; setsWithLoggedReps={loggedSetReps.Count}; perSet=[{perSet}]";
            })
            .Where(line => line is not null)
            .Select(line => line!)
            .ToList();

        return string.Join('\n', lines);
    }
}
