using MongoDB.Bson.Serialization.Attributes;

namespace Mjolksyra.Domain.Database.Models;

[BsonIgnoreExtraElements]
public class PlannedExercise
{
    public Guid Id { get; set; }

    public Guid? ExerciseId { get; set; }

    public required string Name { get; set; }

    public string? Note { get; set; }

    public bool IsPublished { get; set; } = true;

    public ExercisePrescription? Prescription { get; set; }
}

[BsonIgnoreExtraElements]
public class ExercisePrescription
{
    public string? TargetType { get; set; }

    public ICollection<ExercisePrescriptionSet>? Sets { get; set; }
}

[BsonIgnoreExtraElements]
public class ExercisePrescriptionSet
{
    public ExercisePrescriptionSetTarget? Target { get; set; }

    public ExercisePrescriptionSetActual? Actual { get; set; }
}

[BsonIgnoreExtraElements]
public class ExercisePrescriptionSetTarget
{
    public int? Reps { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public double? WeightKg { get; set; }

    public string? Note { get; set; }
}

public class ExercisePrescriptionSetActual
{
    public double? WeightKg { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public bool IsDone { get; set; }
}
