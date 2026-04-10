using Mjolksyra.Domain.Database.Common;
using MongoDB.Bson.Serialization.Attributes;

namespace Mjolksyra.Domain.Database.Models;

[BsonIgnoreExtraElements]
public class CompletedWorkout : IDocument
{
    public Guid Id { get; set; }

    public Guid PlannedWorkoutId { get; set; }

    public Guid TraineeId { get; set; }

    /// <summary>Denormalized from PlannedWorkout for efficient range queries.</summary>
    public DateOnly PlannedAt { get; set; }

    public ICollection<CompletedExercise> Exercises { get; set; } = [];

    public DateTimeOffset? CompletedAt { get; set; }

    public DateTimeOffset? ReviewedAt { get; set; }

    public ICollection<PlannedWorkoutMedia> Media { get; set; } = [];

    public DateTimeOffset CreatedAt { get; set; }
}
