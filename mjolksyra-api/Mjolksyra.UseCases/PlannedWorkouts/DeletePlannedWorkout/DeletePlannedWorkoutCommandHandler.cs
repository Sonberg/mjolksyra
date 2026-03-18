using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Messaging;

namespace Mjolksyra.UseCases.PlannedWorkouts.DeletePlannedWorkout;

public class DeletePlannedWorkoutCommandHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IPlannedWorkoutDeletedPublisher deletedPublisher) : IRequestHandler<DeletePlannedWorkoutCommand>
{
    public async Task Handle(DeletePlannedWorkoutCommand request, CancellationToken cancellationToken)
    {
        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);

        await plannedWorkoutRepository.Delete(request.PlannedWorkoutId, cancellationToken);

        if (workout is not null)
        {
            await deletedPublisher.Publish(new PlannedWorkoutDeletedMessage
            {
                Workout = workout
            }, cancellationToken);
        }
    }
}
