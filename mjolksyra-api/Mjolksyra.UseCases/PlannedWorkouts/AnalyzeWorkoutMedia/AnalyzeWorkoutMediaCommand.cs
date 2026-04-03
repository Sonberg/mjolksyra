using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

public class AnalyzeWorkoutMediaCommand : IRequest<WorkoutMediaAnalysisResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid PlannedWorkoutId { get; set; }

    public required WorkoutMediaAnalysisRequest Analysis { get; set; }
}
