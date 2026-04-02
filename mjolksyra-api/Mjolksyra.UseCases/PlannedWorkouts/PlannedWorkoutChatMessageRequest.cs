using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts;

public class PlannedWorkoutChatMessageRequest
{
    public required string Message { get; set; }

    public ICollection<string> MediaUrls { get; set; } = [];

    public PlannedWorkoutChatRole? Role { get; set; }
}
