using MediatR;
using OneOf;

namespace Mjolksyra.UseCases.CompletedWorkouts.AnalyzeCompletedWorkoutMedia;

public class AnalyzeCompletedWorkoutMediaCommand : IRequest<OneOf<CompletedWorkoutMediaAnalysisResponse, AnalyzeCompletedWorkoutMediaForbidden, AnalyzeCompletedWorkoutMediaInsufficientCredits>>
{
    public required Guid TraineeId { get; set; }

    public required Guid CompletedWorkoutId { get; set; }

    public required CompletedWorkoutMediaAnalysisRequest Analysis { get; set; }
}

public record AnalyzeCompletedWorkoutMediaForbidden;

public record AnalyzeCompletedWorkoutMediaInsufficientCredits(string Reason);
