namespace Mjolksyra.Domain.AI;

public class WorkoutMediaAnalysisInput
{
    public required string Text { get; set; }

    public ICollection<string> ImageUrls { get; set; } = [];

    public ICollection<string> VideoUrls { get; set; } = [];

    public ICollection<WorkoutExerciseAnalysisInput> Exercises { get; set; } = [];

    public required IWorkoutAnalysisToolDispatcher ToolDispatcher { get; set; }
}

public class WorkoutExerciseAnalysisInput
{
    public required string Name { get; set; }

    public ICollection<WorkoutExerciseSetAnalysisInput> Sets { get; set; } = [];
}

public class WorkoutExerciseSetAnalysisInput
{
    public int SetNumber { get; set; }

    public int? TargetReps { get; set; }

    public double? TargetWeightKg { get; set; }

    public int? TargetDurationSeconds { get; set; }

    public double? TargetDistanceMeters { get; set; }

    public string? TargetNote { get; set; }

    public int? ActualReps { get; set; }

    public double? ActualWeightKg { get; set; }

    public int? ActualDurationSeconds { get; set; }

    public double? ActualDistanceMeters { get; set; }

    public string? ActualNote { get; set; }

    public bool? ActualIsDone { get; set; }
}

public class WorkoutMediaAnalysis
{
    public required string Summary { get; set; }

    public ICollection<string> KeyFindings { get; set; } = [];

    public ICollection<string> TechniqueRisks { get; set; } = [];

    public ICollection<string> CoachSuggestions { get; set; } = [];
}
