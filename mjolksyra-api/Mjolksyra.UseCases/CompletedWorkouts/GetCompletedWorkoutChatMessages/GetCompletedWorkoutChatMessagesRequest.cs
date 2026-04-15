using MediatR;

namespace Mjolksyra.UseCases.CompletedWorkouts.GetCompletedWorkoutChatMessages;

public class GetCompletedWorkoutChatMessagesRequest : IRequest<ICollection<CompletedWorkoutChatMessageResponse>>
{
    public required Guid TraineeId { get; set; }

    public required Guid CompletedWorkoutId { get; set; }
}
