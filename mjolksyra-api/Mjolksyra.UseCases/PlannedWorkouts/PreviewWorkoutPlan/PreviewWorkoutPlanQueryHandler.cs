using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Messaging;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;

namespace Mjolksyra.UseCases.PlannedWorkouts.PreviewWorkoutPlan;

public class PreviewWorkoutPlanQueryHandler(
    IAIWorkoutPlannerAgent plannerAgent,
    IPlannedWorkoutRepository plannedWorkoutRepository,
    ICompletedWorkoutRepository completedWorkoutRepository,
    IWorkoutMediaAnalysisRepository workoutMediaAnalysisRepository,
    IExerciseRepository exerciseRepository,
    IPlannedWorkoutDeletedPublisher plannedWorkoutDeletedPublisher,
    ITraineeRepository traineeRepository,
    ITraineeInsightsRepository traineeInsightsRepository,
    ICoachInsightsRepository coachInsightsRepository,
    IUserContext userContext) : IRequestHandler<PreviewWorkoutPlanQuery, PreviewWorkoutPlanResponse?>
{
    public async Task<PreviewWorkoutPlanResponse?> Handle(PreviewWorkoutPlanQuery request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return null;
        }

        var innerDispatcher = new AIPlannerToolDispatcher(
            plannedWorkoutRepository,
            completedWorkoutRepository,
            workoutMediaAnalysisRepository,
            exerciseRepository,
            plannedWorkoutDeletedPublisher,
            traineeInsightsRepository,
            coachInsightsRepository,
            request.TraineeId,
            userId);

        var loggingDispatcher = new LoggingAIPlannerToolDispatcher(innerDispatcher);

        var workoutOutputs = await plannerAgent.GenerateAsync(new AIPlannerGenerateInput
        {
            Description = request.Description,
            FilesContent = request.FilesContent,
            ConversationHistory = request.ConversationHistory,
            Params = new AIPlannerGenerateParams
            {
                StartDate = request.Params.StartDate,
                NumberOfWeeks = request.Params.NumberOfWeeks,
                ConflictStrategy = request.Params.ConflictStrategy,
            },
            ToolDispatcher = loggingDispatcher,
        }, cancellationToken);

        return new PreviewWorkoutPlanResponse
        {
            Workouts = PreviewWorkoutPlanMapper.FromOutputs(workoutOutputs),
        };
    }
}
