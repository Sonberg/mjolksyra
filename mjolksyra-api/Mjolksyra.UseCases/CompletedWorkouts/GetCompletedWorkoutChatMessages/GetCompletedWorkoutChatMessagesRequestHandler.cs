using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.CompletedWorkouts.GetCompletedWorkoutChatMessages;

public class GetCompletedWorkoutChatMessagesRequestHandler(
    ICompletedWorkoutRepository completedWorkoutRepository,
    ICompletedWorkoutChatMessageRepository completedWorkoutChatMessageRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext)
    : IRequestHandler<GetCompletedWorkoutChatMessagesRequest, ICollection<CompletedWorkoutChatMessageResponse>>
{
    public async Task<ICollection<CompletedWorkoutChatMessageResponse>> Handle(GetCompletedWorkoutChatMessagesRequest request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return [];
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return [];
        }

        var completedWorkout = await completedWorkoutRepository.GetById(request.CompletedWorkoutId, cancellationToken);
        if (completedWorkout is null || completedWorkout.TraineeId != request.TraineeId)
        {
            return [];
        }

        var messages = await completedWorkoutChatMessageRepository.GetByWorkoutId(request.TraineeId, request.CompletedWorkoutId, cancellationToken);
        return messages
            .Select(CompletedWorkoutChatMessageResponse.From)
            .ToList();
    }
}
