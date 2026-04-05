namespace Mjolksyra.Domain.AI;

public class AIPlannerFileContent
{
    public required string Name { get; set; }

    public required string Type { get; set; }

    public required string Content { get; set; }
}

public class AIPlannerConversationMessage
{
    public required string Role { get; set; }

    public required string Content { get; set; }
}

public class AIPlannerClarifyInput
{
    public required string Description { get; set; }

    public ICollection<AIPlannerFileContent> FilesContent { get; set; } = [];

    public ICollection<AIPlannerConversationMessage> ConversationHistory { get; set; } = [];

    public required IAIPlannerToolDispatcher ToolDispatcher { get; set; }
}

public class AIPlannerClarifyOutput
{
    public required string Message { get; set; }

    public bool IsReadyToGenerate { get; set; }

    public AIPlannerSuggestedParams? SuggestedParams { get; set; }

    public ICollection<string> Options { get; set; } = [];
}

public class AIPlannerSuggestedParams
{
    public required string StartDate { get; set; }

    public int NumberOfWeeks { get; set; }

    public string ConflictStrategy { get; set; } = "Skip";
}

public class AIPlannerGenerateInput
{
    public required string Description { get; set; }

    public ICollection<AIPlannerFileContent> FilesContent { get; set; } = [];

    public ICollection<AIPlannerConversationMessage> ConversationHistory { get; set; } = [];

    public required AIPlannerGenerateParams Params { get; set; }

    public required IAIPlannerToolDispatcher ToolDispatcher { get; set; }
}

public class AIPlannerGenerateParams
{
    public required string StartDate { get; set; }

    public int NumberOfWeeks { get; set; }

    public string ConflictStrategy { get; set; } = "Skip";
}

public class AIPlannerWorkoutOutput
{
    public string? Name { get; set; }

    public string? Note { get; set; }

    public required string PlannedAt { get; set; }

    public ICollection<AIPlannerExerciseOutput> Exercises { get; set; } = [];
}

public class AIPlannerExerciseOutput
{
    public required string Name { get; set; }

    public string? Note { get; set; }

    public string? PrescriptionType { get; set; }

    public ICollection<AIPlannerSetOutput> Sets { get; set; } = [];
}

public class AIPlannerSetOutput
{
    public int? Reps { get; set; }

    public double? WeightKg { get; set; }

    public int? DurationSeconds { get; set; }

    public double? DistanceMeters { get; set; }

    public string? Note { get; set; }
}
