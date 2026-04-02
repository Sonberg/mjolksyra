using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkoutChatMessages;

public class GetPlannedWorkoutChatMessagesRequest : IRequest<ICollection<PlannedWorkoutChatMessageResponse>>
{
    public required Guid TraineeId { get; set; }

    public required Guid PlannedWorkoutId { get; set; }
}
