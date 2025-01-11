using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Common.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkouts;

public class GetPlannedWorkoutsRequestHandler : IRequestHandler<GetPlannedWorkoutsRequest, PaginatedResponse<PlannedWorkoutResponse>>
{
    private readonly IPlannedWorkoutRepository _plannedWorkoutRepository;

    private readonly ITraineeRepository _traineeRepository;

    private readonly IUserContext _userContext;

    public GetPlannedWorkoutsRequestHandler(
        IPlannedWorkoutRepository plannedWorkoutRepository,
        ITraineeRepository traineeRepository,
        IUserContext userContext)
    {
        _plannedWorkoutRepository = plannedWorkoutRepository;
        _traineeRepository = traineeRepository;
        _userContext = userContext;
    }

    public async Task<PaginatedResponse<PlannedWorkoutResponse>> Handle(GetPlannedWorkoutsRequest request, CancellationToken cancellationToken)
    {
        if (_userContext.UserId is not { } userId)
        {
            return new PaginatedResponse<PlannedWorkoutResponse>
            {
                Data = Array.Empty<PlannedWorkoutResponse>(),
                Next = null
            };
        }

        if (!await _traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return new PaginatedResponse<PlannedWorkoutResponse>
            {
                Data = Array.Empty<PlannedWorkoutResponse>(),
                Next = null
            };
        }

        var workouts = request switch
        {
            { Cursor: not null } => await _plannedWorkoutRepository.Get(request.Cursor, cancellationToken),
            _ => await _plannedWorkoutRepository.Get(request.TraineeId, request.From, request.To, request.Limit, cancellationToken)
        };


        return new PaginatedResponse<PlannedWorkoutResponse>
        {
            Next = workouts.Cursor,
            Data = workouts.Data
                .Select(PlannedWorkoutResponse.From)
                .ToList(),
        };
    }
}