using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkoutChatMessage;

public class UpdatePlannedWorkoutChatMessageCommandHandler(
    IPlannedWorkoutRepository plannedWorkoutRepository,
    IPlannedWorkoutChatMessageRepository plannedWorkoutChatMessageRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<UpdatePlannedWorkoutChatMessageCommand, PlannedWorkoutChatMessageResponse?>
{
    public async Task<PlannedWorkoutChatMessageResponse?> Handle(UpdatePlannedWorkoutChatMessageCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        var workout = await plannedWorkoutRepository.Get(request.PlannedWorkoutId, cancellationToken);
        if (workout is null || workout.TraineeId != request.TraineeId)
        {
            return null;
        }

        var existingMessage = await plannedWorkoutChatMessageRepository.GetById(request.ChatMessageId, cancellationToken);
        if (existingMessage is null
            || existingMessage.TraineeId != request.TraineeId
            || existingMessage.PlannedWorkoutId != request.PlannedWorkoutId)
        {
            return null;
        }

        if (existingMessage.UserId != userId)
        {
            return null;
        }

        var updatedMessageBody = request.Message.Message.Trim();
        if (string.IsNullOrWhiteSpace(updatedMessageBody))
        {
            return null;
        }

        var updated = await plannedWorkoutChatMessageRepository.UpdateMessage(
            request.ChatMessageId,
            updatedMessageBody,
            DateTimeOffset.UtcNow,
            cancellationToken);

        return updated is null ? null : PlannedWorkoutChatMessageResponse.From(updated);
    }
}
