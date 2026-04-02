using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkoutChatMessages;

public class GetPlannedWorkoutChatMessagesRequestHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IPlannedWorkoutChatMessageRepository plannedWorkoutChatMessageRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<GetPlannedWorkoutChatMessagesRequest, ICollection<PlannedWorkoutChatMessageResponse>>
{
    public async Task<ICollection<PlannedWorkoutChatMessageResponse>> Handle(GetPlannedWorkoutChatMessagesRequest request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return [];
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return [];
        }

        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (workout is null || workout.TraineeId != request.TraineeId)
        {
            return [];
        }

        var messages = await plannedWorkoutChatMessageRepository.GetByWorkoutId(request.TraineeId, request.PlannedWorkoutId, cancellationToken);
        return messages
            .Select(PlannedWorkoutChatMessageResponse.From)
            .ToList();
    }
}
