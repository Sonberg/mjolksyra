using MediatR;

namespace Mjolksyra.UseCases.CompletedWorkouts.AddCompletedWorkoutChatMessage;

public class AddCompletedWorkoutChatMessageCommand : IRequest<CompletedWorkoutChatMessageResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid CompletedWorkoutId { get; set; }

    public required CompletedWorkoutChatMessageRequest Message { get; set; }
}
