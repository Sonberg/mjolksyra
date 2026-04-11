using MediatR;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.CompletedWorkouts.UpdateCompletedWorkoutChatMessage;

public class UpdateCompletedWorkoutChatMessageCommandHandler(
    ICompletedWorkoutRepository completedWorkoutRepository,
    ICompletedWorkoutChatMessageRepository completedWorkoutChatMessageRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext)
    : IRequestHandler<UpdateCompletedWorkoutChatMessageCommand, CompletedWorkoutChatMessageResponse?>
{
    public async Task<CompletedWorkoutChatMessageResponse?> Handle(UpdateCompletedWorkoutChatMessageCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        if (!await traineeRepository.HasAccess(request.TraineeId, userId, cancellationToken))
        {
            return null;
        }

        var completedWorkout = await completedWorkoutRepository.GetById(request.CompletedWorkoutId, cancellationToken);
        if (completedWorkout is null || completedWorkout.TraineeId != request.TraineeId)
        {
            return null;
        }

        var existingMessage = await completedWorkoutChatMessageRepository.GetById(request.ChatMessageId, cancellationToken);
        if (existingMessage is null
            || existingMessage.TraineeId != request.TraineeId
            || existingMessage.CompletedWorkoutId != request.CompletedWorkoutId)
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

        var updated = await completedWorkoutChatMessageRepository.UpdateMessage(
            request.ChatMessageId,
            updatedMessageBody,
            DateTimeOffset.UtcNow,
            cancellationToken);

        return updated is null ? null : CompletedWorkoutChatMessageResponse.From(updated);
    }
}
