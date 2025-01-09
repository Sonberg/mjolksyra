using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.PlannedWorkouts.DeletePlannedWorkout;

public class DeletePlannedWorkoutCommandHandler : IRequestHandler<DeletePlannedWorkoutCommand>
{
    private readonly IPlannedWorkoutRepository _plannedWorkoutRepository;

    public DeletePlannedWorkoutCommandHandler(IPlannedWorkoutRepository plannedWorkoutRepository)
    {
        _plannedWorkoutRepository = plannedWorkoutRepository;
    }

    public async Task Handle(DeletePlannedWorkoutCommand request, CancellationToken cancellationToken)
    {
        await _plannedWorkoutRepository.Delete(request.PlannedWorkoutId, cancellationToken);
    }
}