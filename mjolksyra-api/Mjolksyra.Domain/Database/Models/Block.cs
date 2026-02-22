using Mjolksyra.Domain.Database.Common;

namespace Mjolksyra.Domain.Database.Models;

public class Block : IDocument
{
    public Guid Id { get; set; }

    public Guid CoachId { get; set; }

    public required string Name { get; set; }

    public int NumberOfWeeks { get; set; }

    public required ICollection<BlockWorkout> Workouts { get; set; }

    public DateTimeOffset CreatedAt { get; set; }
}

public class BlockWorkout
{
    public Guid Id { get; set; }

    public string? Name { get; set; }

    public string? Note { get; set; }

    public required ICollection<BlockExercise> Exercises { get; set; }

    /// <summary>1-based week number within the block (1 = first week)</summary>
    public int Week { get; set; }

    /// <summary>1=Monday … 7=Sunday</summary>
    public int DayOfWeek { get; set; }
}

public class BlockExercise
{
    public Guid Id { get; set; }

    public Guid? ExerciseId { get; set; }

    public required string Name { get; set; }

    public string? Note { get; set; }
}
