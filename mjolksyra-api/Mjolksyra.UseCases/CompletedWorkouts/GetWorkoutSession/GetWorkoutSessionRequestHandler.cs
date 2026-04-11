using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
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

        var session = await completedWorkoutRepository.GetById(request.Id, cancellationToken);
        if (session is null || session.TraineeId != request.TraineeId)
        {
            return null;
        }

        var masterExercises = await exerciseRepository.GetMany(
            session.Exercises.Select(e => e.ExerciseId).OfType<Guid>().Distinct().ToList(),
            cancellationToken);

        return CompletedWorkoutResponse.From(session, masterExercises);
    }
}
