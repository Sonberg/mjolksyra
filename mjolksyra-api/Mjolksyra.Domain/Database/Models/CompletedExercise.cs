using MongoDB.Bson.Serialization.Attributes;

namespace Mjolksyra.Domain.Database.Models;

/// <summary>
/// Mirrors PlannedExercise but lives inside a CompletedWorkout (athlete's session).
/// Initialized from PublishedExercises; athlete can freely add/delete/reorder — no addedBy restriction.
/// </summary>
[BsonIgnoreExtraElements]
public class CompletedExercise
{
    public Guid Id { get; set; }

    public Guid? ExerciseId { get; set; }

    public required string Name { get; set; }

    public string? Note { get; set; }

    /// <summary>Reuses ExercisePrescription which holds Target + Actual per set.</summary>
    public ExercisePrescription? Prescription { get; set; }
}
