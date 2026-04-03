using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

public class AnalyzeWorkoutMediaCommandHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
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

        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (workout is null || workout.TraineeId != request.TraineeId)
        {
            return null;
        }

        var analysis = await workoutMediaAnalysisAgent.AnalyzeAsync(new WorkoutMediaAnalysisInput
        {
            Text = request.Analysis.Text.Trim(),
            MediaUrls = request.Analysis.MediaUrls,
        }, cancellationToken);

        await workoutMediaAnalysisRepository.Create(new WorkoutMediaAnalysisRecord
        {
            Id = Guid.NewGuid(),
            TraineeId = request.TraineeId,
            PlannedWorkoutId = request.PlannedWorkoutId,
            RequestedByUserId = userId,
            Text = request.Analysis.Text.Trim(),
            MediaUrls = request.Analysis.MediaUrls,
            Summary = analysis.Summary,
            KeyFindings = analysis.KeyFindings,
            TechniqueRisks = analysis.TechniqueRisks,
            CoachSuggestions = analysis.CoachSuggestions,
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);

        return WorkoutMediaAnalysisResponse.From(analysis);
    }
}
