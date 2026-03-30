using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.PlannedWorkouts.ReplaceMediaUrl;

public class ReplaceMediaUrlCommandHandler(IPlannedWorkoutRepository plannedWorkoutRepository)
    : IRequestHandler<ReplaceMediaUrlCommand>
{
    public async Task Handle(ReplaceMediaUrlCommand request, CancellationToken cancellationToken)
    {
        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (workout is null) return;

        var item = workout.Media.FirstOrDefault(m => m.RawUrl == request.OldUrl);
        if (item is null) return; // idempotent: URL not found or already compressed

        item.CompressedUrl = request.CompressedUrl;

        await plannedWorkoutRepository.Update(workout, cancellationToken);
    }
}
