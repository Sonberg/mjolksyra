using MediatR;

namespace Mjolksyra.UseCases.CompletedWorkouts.GetLatestCompletedWorkoutMediaAnalysis;

public class GetLatestCompletedWorkoutMediaAnalysisRequest : IRequest<CompletedWorkoutMediaAnalysisResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid CompletedWorkoutId { get; set; }
}
