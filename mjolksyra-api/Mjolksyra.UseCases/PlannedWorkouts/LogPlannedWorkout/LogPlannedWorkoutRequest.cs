namespace Mjolksyra.UseCases.PlannedWorkouts.LogPlannedWorkout;

public class LogPlannedWorkoutRequest
{
    public DateTimeOffset? CompletedAt { get; set; }

    public string? CompletionNote { get; set; }

    public ICollection<string> MediaUrls { get; set; } = [];

    public required ICollection<PlannedExerciseLogRequest> Exercises { get; set; }
}

public class PlannedExerciseLogRequest
{
    public required Guid Id { get; set; }

    public required ICollection<ExercisePrescriptionSetActualRequest> Sets { get; set; }
}

public class ExercisePrescriptionSetActualRequest
{
    public int? Reps { get; set; }

    public double? WeightKg { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public string? Note { get; set; }

    public bool IsDone { get; set; }
}
