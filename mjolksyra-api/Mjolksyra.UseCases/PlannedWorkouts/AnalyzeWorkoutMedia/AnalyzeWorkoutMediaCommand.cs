using MediatR;
using OneOf;

namespace Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

public class AnalyzeWorkoutMediaCommand : IRequest<OneOf<WorkoutMediaAnalysisResponse, AnalyzeWorkoutMediaForbidden, AnalyzeWorkoutMediaInsufficientCredits>>
{
    public required Guid TraineeId { get; set; }

    public required Guid PlannedWorkoutId { get; set; }

    public required WorkoutMediaAnalysisRequest Analysis { get; set; }
}

public record AnalyzeWorkoutMediaForbidden;

public record AnalyzeWorkoutMediaInsufficientCredits(string Reason);
