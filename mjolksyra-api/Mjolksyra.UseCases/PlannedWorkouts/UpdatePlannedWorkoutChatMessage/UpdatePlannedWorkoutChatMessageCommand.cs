using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkoutChatMessage;

public class UpdatePlannedWorkoutChatMessageCommand : IRequest<PlannedWorkoutChatMessageResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid PlannedWorkoutId { get; set; }

    public required Guid ChatMessageId { get; set; }

    public required PlannedWorkoutChatMessageEditRequest Message { get; set; }
}
