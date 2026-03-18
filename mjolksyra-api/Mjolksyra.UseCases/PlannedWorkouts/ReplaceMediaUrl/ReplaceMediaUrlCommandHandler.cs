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

        var index = workout.MediaUrls.ToList().IndexOf(request.OldUrl);
        if (index < 0) return; // idempotent: URL already replaced or not found

        var urls = workout.MediaUrls.ToList();
        urls[index] = request.NewUrl;
        workout.MediaUrls = urls;

        await plannedWorkoutRepository.Update(workout, cancellationToken);
    }
}
