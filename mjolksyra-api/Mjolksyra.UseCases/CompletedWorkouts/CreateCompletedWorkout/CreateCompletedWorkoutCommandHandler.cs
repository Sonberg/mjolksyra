using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.CompletedWorkouts.CreateCompletedWorkout;

public class CreateCompletedWorkoutCommandHandler(
    ICompletedWorkoutRepository completedWorkoutRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<CreateCompletedWorkoutCommand, CompletedWorkoutResponse?>
{
    public async Task<CompletedWorkoutResponse?> Handle(CreateCompletedWorkoutCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        var completedWorkout = await completedWorkoutRepository.Create(new CompletedWorkout
        {
            Id = Guid.NewGuid(),
            PlannedWorkoutId = null,
            TraineeId = request.TraineeId,
            PlannedAt = request.Workout.PlannedAt,
            Exercises = [],
            CompletedAt = null,
            ReviewedAt = null,
            Media = [],
            CreatedAt = DateTimeOffset.UtcNow,
        }, cancellationToken);

        return CompletedWorkoutResponse.From(completedWorkout, []);
    }
}
