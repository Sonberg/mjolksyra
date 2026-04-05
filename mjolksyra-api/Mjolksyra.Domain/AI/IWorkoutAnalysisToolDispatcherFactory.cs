namespace Mjolksyra.Domain.AI;

public interface IWorkoutAnalysisToolDispatcherFactory
{
    IWorkoutAnalysisToolDispatcher Create(Guid traineeId);
}
