using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.CompletedWorkouts.GetLatestCompletedWorkoutMediaAnalysis;

public class GetLatestCompletedWorkoutMediaAnalysisRequestHandler(
    ICompletedWorkoutRepository completedWorkoutRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext,
    IWorkoutMediaAnalysisRepository workoutMediaAnalysisRepository)
    : IRequestHandler<GetLatestCompletedWorkoutMediaAnalysisRequest, CompletedWorkoutMediaAnalysisResponse?>
{
    public async Task<CompletedWorkoutMediaAnalysisResponse?> Handle(GetLatestCompletedWorkoutMediaAnalysisRequest request, CancellationToken cancellationToken)
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

        var completedWorkout = await completedWorkoutRepository.GetById(request.CompletedWorkoutId, cancellationToken);
        if (completedWorkout is null || completedWorkout.TraineeId != request.TraineeId)
        {
            return null;
        }

        var latest = await workoutMediaAnalysisRepository.GetLatest(request.TraineeId, request.CompletedWorkoutId, cancellationToken);
        return latest is null ? null : CompletedWorkoutMediaAnalysisResponse.From(latest);
    }
}
