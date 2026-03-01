namespace Mjolksyra.Domain.Database.Models;

public class PlannedExercise
{
    public Guid Id { get; set; }

    public Guid? ExerciseId { get; set; }

    public required string Name { get; set; }

    public string? Note { get; set; }

    public bool IsPublished { get; set; } = true;

    public bool IsDone { get; set; } = false;

    public ExercisePrescription? Prescription { get; set; }
}

public class ExercisePrescription
{
    public string? TargetType { get; set; }

    public int? Sets { get; set; }

    public int? Reps { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }
}
