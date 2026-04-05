using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;

public class WorkoutAnalysisToolDispatcherFactory(IPlannedWorkoutRepository plannedWorkoutRepository)
    : IWorkoutAnalysisToolDispatcherFactory
{
    public IWorkoutAnalysisToolDispatcher Create(Guid traineeId)
        => new WorkoutAnalysisToolDispatcher(plannedWorkoutRepository, traineeId);
}
