using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkouts;

public class GetPlannedWorkoutsRequestHandler : IRequestHandler<GetPlannedWorkoutsRequest, ICollection<PlannedWorkoutResponse>>
{
    private readonly IPlannedWorkoutRepository _plannedWorkoutRepository;

    public GetPlannedWorkoutsRequestHandler(IPlannedWorkoutRepository plannedWorkoutRepository)
    {
        _plannedWorkoutRepository = plannedWorkoutRepository;
    }

    public async Task<ICollection<PlannedWorkoutResponse>> Handle(GetPlannedWorkoutsRequest request, CancellationToken cancellationToken)
    {
        var workouts = await _plannedWorkoutRepository.Get(request.TraineeId, request.From, request.To, cancellationToken);
        var result = workouts.Select(PlannedWorkoutResponse.From).ToList();

        return result;
    }
}