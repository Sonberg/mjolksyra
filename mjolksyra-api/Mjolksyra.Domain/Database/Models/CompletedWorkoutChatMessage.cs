using Mjolksyra.Domain.Database.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Mjolksyra.Domain.Database.Models;

public enum CompletedWorkoutChatRole { Athlete, Coach }

[BsonIgnoreExtraElements]
public class CompletedWorkoutChatMessage : IDocument
{
    public Guid Id { get; set; }

    public Guid CompletedWorkoutId { get; set; }

    public Guid TraineeId { get; set; }

    public Guid UserId { get; set; }

    public required string Message { get; set; }

    public ICollection<PlannedWorkoutMedia> Media { get; set; } = [];

    [BsonRepresentation(BsonType.String)]
    public CompletedWorkoutChatRole Role { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset ModifiedAt { get; set; }
}
