using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.CompletedWorkouts.GetWorkoutSession;

public class GetWorkoutSessionRequestHandler(
    ICompletedWorkoutRepository completedWorkoutRepository,
    IExerciseRepository exerciseRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<GetWorkoutSessionRequest, CompletedWorkoutResponse?>
{
    public async Task<CompletedWorkoutResponse?> Handle(GetWorkoutSessionRequest request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        var session = await completedWorkoutRepository.GetByPlannedWorkoutId(request.PlannedWorkoutId, cancellationToken);
        if (session is null || session.TraineeId != request.TraineeId)
        {
            return null;
        }

        var exerciseIds = session.Exercises
            .Select(e => e.ExerciseId)
            .OfType<Guid>()
            .ToList();

        var masterExercises = await exerciseRepository.GetMany(exerciseIds, cancellationToken);

        return CompletedWorkoutResponse.From(session, masterExercises);
    }
}
