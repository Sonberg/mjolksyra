using Mjolksyra.Domain.Database.Common;

namespace Mjolksyra.Domain.Database.Models;

public class PlannedWorkout : IDocument
{
    public Guid Id { get; set; }

    public Guid TraineeId { get; set; }

    public string? Name { get; set; }

    public string? Note { get; set; }

    public required ICollection<PlannedExercise> Exercises { get; set; }

    public DateOnly PlannedAt { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public bool IsEmpty => string.IsNullOrEmpty(Note) && string.IsNullOrEmpty(Name) && Exercises.Count == 0;
}