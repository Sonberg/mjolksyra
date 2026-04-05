using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;

namespace Mjolksyra.UseCases.PlannedWorkouts.ClarifyWorkoutPlan;

public class ClarifyWorkoutPlanQueryHandler(
    IAIWorkoutPlannerAgent plannerAgent,
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IWorkoutMediaAnalysisRepository workoutMediaAnalysisRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<ClarifyWorkoutPlanQuery, ClarifyWorkoutPlanResponse?>
{
    public async Task<ClarifyWorkoutPlanResponse?> Handle(ClarifyWorkoutPlanQuery request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        var toolDispatcher = new AIPlannerToolDispatcher(
            plannedWorkoutRepository,
            workoutMediaAnalysisRepository,
            exerciseRepository,
            request.TraineeId);

        var output = await plannerAgent.ClarifyAsync(new AIPlannerClarifyInput
        {
            Description = request.Description,
            FilesContent = request.FilesContent,
            ConversationHistory = request.ConversationHistory,
            ToolDispatcher = toolDispatcher,
        }, cancellationToken);

        return new ClarifyWorkoutPlanResponse
        {
            Message = output.Message,
            IsReadyToGenerate = output.IsReadyToGenerate,
            SuggestedParams = output.SuggestedParams is null ? null : new ClarifyWorkoutPlanSuggestedParams
            {
                StartDate = output.SuggestedParams.StartDate,
                NumberOfWeeks = output.SuggestedParams.NumberOfWeeks,
                ConflictStrategy = output.SuggestedParams.ConflictStrategy,
            },
        };
    }
}
