using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts;

public class PlannedWorkoutMediaResponse
{
    public required string RawUrl { get; set; }
    public string? CompressedUrl { get; set; }
    public PlannedWorkoutMediaType Type { get; set; }
}

public class PlannedWorkoutChatMessageResponse
{
    public required Guid Id { get; set; }

    public required Guid UserId { get; set; }

    public required string Message { get; set; }

    public ICollection<PlannedWorkoutMediaResponse> Media { get; set; } = [];

    public PlannedWorkoutChatRole Role { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset ModifiedAt { get; set; }

    public static PlannedWorkoutChatMessageResponse From(PlannedWorkoutChatMessage message)
    {
        return new PlannedWorkoutChatMessageResponse
        {
            Id = message.Id,
            UserId = message.UserId,
            Message = message.Message,
            Media = message.Media
                .Select(media => new PlannedWorkoutMediaResponse
                {
                    RawUrl = media.RawUrl,
                    CompressedUrl = media.CompressedUrl,
                    Type = media.Type,
                })
                .ToList(),
            Role = message.Role,
            CreatedAt = message.CreatedAt,
            ModifiedAt = message.ModifiedAt,
        };
    }
}
