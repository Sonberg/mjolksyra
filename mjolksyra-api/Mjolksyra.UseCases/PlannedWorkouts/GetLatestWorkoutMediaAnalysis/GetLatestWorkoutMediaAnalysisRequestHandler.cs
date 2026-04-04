using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetLatestWorkoutMediaAnalysis;

public class GetLatestWorkoutMediaAnalysisRequestHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext,
    IWorkoutMediaAnalysisRepository workoutMediaAnalysisRepository)
    : IRequestHandler<GetLatestWorkoutMediaAnalysisRequest, WorkoutMediaAnalysisResponse?>
{
    public async Task<WorkoutMediaAnalysisResponse?> Handle(GetLatestWorkoutMediaAnalysisRequest request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return null;
        }

        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (workout is null || workout.TraineeId != request.TraineeId)
        {
            return null;
        }

        var latest = await workoutMediaAnalysisRepository.GetLatest(request.TraineeId, request.PlannedWorkoutId, cancellationToken);
        return latest is null ? null : WorkoutMediaAnalysisResponse.From(latest);
    }
}
