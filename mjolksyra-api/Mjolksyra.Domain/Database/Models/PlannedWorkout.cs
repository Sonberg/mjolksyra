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

    public DateTimeOffset? CompletedAt { get; set; }

    public string? CompletionNote { get; set; }

    public DateTimeOffset? ReviewedAt { get; set; }

    public string? ReviewNote { get; set; }

    public PlannedWorkoutAppliedBlock? AppliedBlock { get; set; }

    public bool IsEmpty => string.IsNullOrEmpty(Note) && string.IsNullOrEmpty(Name) && Exercises.Count == 0;
}

public class PlannedWorkoutAppliedBlock
{
    public Guid BlockId { get; set; }

    public required string BlockName { get; set; }

    public DateOnly StartDate { get; set; }

    public int WeekNumber { get; set; }

    public int TotalWeeks { get; set; }
}
