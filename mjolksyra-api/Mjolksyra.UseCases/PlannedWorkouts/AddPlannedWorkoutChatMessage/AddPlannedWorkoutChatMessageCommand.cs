using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.AddPlannedWorkoutChatMessage;

public class AddPlannedWorkoutChatMessageCommand : IRequest<PlannedWorkoutChatMessageResponse?>
{
    public required Guid TraineeId { get; set; }

    public required Guid PlannedWorkoutId { get; set; }

    public required PlannedWorkoutChatMessageRequest Message { get; set; }
}
