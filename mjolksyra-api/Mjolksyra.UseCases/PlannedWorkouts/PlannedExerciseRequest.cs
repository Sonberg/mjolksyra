namespace Mjolksyra.UseCases.PlannedWorkouts;

public class PlannedExerciseRequest
{
    public Guid Id { get; set; }

    public Guid? ExerciseId { get; set; }

    public required string Name { get; set; }

    public string? Note { get; set; }

    public bool IsPublished { get; set; } = true;

    public bool IsDone { get; set; } = false;

    public PlannedExercisePrescriptionRequest? Prescription { get; set; }
}

public class PlannedExercisePrescriptionRequest
{
    public string? TargetType { get; set; }

    public ICollection<PlannedExercisePrescriptionSetTargetRequest>? SetTargets { get; set; }
}

public class PlannedExercisePrescriptionSetTargetRequest
{
    public int? Reps { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public string? Note { get; set; }
}
