using MediatR;

namespace Mjolksyra.UseCases.CompletedWorkouts.UpdateCompletedWorkoutChatMessage;

public class UpdateCompletedWorkoutChatMessageCommand : IRequest<CompletedWorkoutChatMessageResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid CompletedWorkoutId { get; set; }

    public required Guid ChatMessageId { get; set; }

    public required CompletedWorkoutChatMessageEditRequest Message { get; set; }
}
