using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.CompletedWorkouts;

public class CompletedWorkoutChatMessageRequest
{
    public required string Message { get; set; }

    public ICollection<string> MediaUrls { get; set; } = [];

    public CompletedWorkoutChatRole? Role { get; set; }
}
