using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts;

public class PlannedExerciseRequest
{
    public Guid Id { get; set; }

    public Guid? ExerciseId { get; set; }

    public required string Name { get; set; }

    public string? Note { get; set; }

    public bool IsPublished { get; set; } = true;

    public PlannedExercisePrescriptionRequest? Prescription { get; set; }
}

public class PlannedExercisePrescriptionRequest
{
    public ExercisePrescriptionTargetType? TargetType { get; set; }

    public ICollection<ExercisePrescriptionSetRequest>? Sets { get; set; }
}

public class ExercisePrescriptionSetRequest
{
    public ExercisePrescriptionSetTargetRequest? Target { get; set; }
}

public class ExercisePrescriptionSetTargetRequest
{
    public int? Reps { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public double? WeightKg { get; set; }

    public string? Note { get; set; }
}
