namespace Mjolksyra.UseCases.PlannedWorkouts;

public class PlannedWorkoutChatMessageRequest
{
    public required string Message { get; set; }

    public ICollection<string> MediaUrls { get; set; } = [];
}
