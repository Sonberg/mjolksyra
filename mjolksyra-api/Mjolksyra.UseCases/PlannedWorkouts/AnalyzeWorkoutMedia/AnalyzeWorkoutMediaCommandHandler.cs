using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

public class AnalyzeWorkoutMediaCommandHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IPlannedWorkoutChatMessageRepository plannedWorkoutChatMessageRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext,
    IWorkoutMediaAnalysisRepository workoutMediaAnalysisRepository,
    IWorkoutMediaAnalysisAgent workoutMediaAnalysisAgent) : IRequestHandler<AnalyzeWorkoutMediaCommand, WorkoutMediaAnalysisResponse?>
{
    public async Task<WorkoutMediaAnalysisResponse?> Handle(AnalyzeWorkoutMediaCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return null;
        }

        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (workout is null || workout.TraineeId != request.TraineeId)
        {
            return null;
        }

        var chatMessages = await plannedWorkoutChatMessageRepository.GetByWorkoutId(
            request.TraineeId,
            request.PlannedWorkoutId,
            cancellationToken);

        var analysisText = request.Analysis.Text.Trim();
        if (chatMessages.Count > 0)
        {
            var chatHistory = string.Join('\n', chatMessages.Select(message =>
                $"- [{message.Role}] {(string.IsNullOrWhiteSpace(message.Message) ? "(no text)" : message.Message)}"));
            analysisText = $"{analysisText}\n\nWorkout chat history:\n{chatHistory}";
        }

        var mediaUrls = workout.Media
            .Select(x => x.CompressedUrl ?? x.RawUrl)
            .Concat(chatMessages.SelectMany(x => x.Media).Select(x => x.CompressedUrl ?? x.RawUrl))
            .Where(url => !string.IsNullOrWhiteSpace(url))
            .Distinct()
            .ToList();

        var analysis = await workoutMediaAnalysisAgent.AnalyzeAsync(new WorkoutMediaAnalysisInput
        {
            Text = analysisText,
            MediaUrls = mediaUrls,
            Exercises = workout.Exercises
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

        await workoutMediaAnalysisRepository.Create(new WorkoutMediaAnalysisRecord
        {
            Id = Guid.NewGuid(),
            TraineeId = request.TraineeId,
            PlannedWorkoutId = request.PlannedWorkoutId,
            RequestedByUserId = userId,
            Text = request.Analysis.Text.Trim(),
            MediaUrls = mediaUrls,
            Summary = analysis.Summary,
            KeyFindings = analysis.KeyFindings,
            TechniqueRisks = analysis.TechniqueRisks,
            CoachSuggestions = analysis.CoachSuggestions,
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);

        return WorkoutMediaAnalysisResponse.From(analysis);
    }
}
