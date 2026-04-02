using Mjolksyra.Domain.Database.Common;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace Mjolksyra.Domain.Database.Models;

public enum PlannedWorkoutChatRole { Athlete, Coach }

[BsonIgnoreExtraElements]
public class PlannedWorkoutChatMessage : IDocument
{
    public Guid Id { get; set; }

    public Guid PlannedWorkoutId { get; set; }

    public Guid TraineeId { get; set; }

    public Guid UserId { get; set; }

    public required string Message { get; set; }

    public ICollection<PlannedWorkoutMedia> Media { get; set; } = [];

    [BsonRepresentation(BsonType.String)]
    public PlannedWorkoutChatRole Role { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset ModifiedAt { get; set; }
}
