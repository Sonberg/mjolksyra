using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetLatestWorkoutMediaAnalysis;

public class GetLatestWorkoutMediaAnalysisRequest : IRequest<WorkoutMediaAnalysisResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid PlannedWorkoutId { get; set; }
}
