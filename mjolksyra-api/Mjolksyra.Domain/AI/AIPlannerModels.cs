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

    public bool IsReadyToApply { get; set; }

    public bool RequiresApproval { get; set; }

    public AIPlannerSuggestedParams? SuggestedParams { get; set; }

    public AIPlannerActionSet? ProposedActionSet { get; set; }

    public ICollection<AIPlannerWorkoutOutput> PreviewWorkouts { get; set; } = [];

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

public class AIPlannerActionSet
{
    public Guid Id { get; set; }

    public string Status { get; set; } = AIPlannerProposalStatus.Pending;

    public required string Summary { get; set; }

    public string? Explanation { get; set; }

    public string? AffectedDateFrom { get; set; }

    public string? AffectedDateTo { get; set; }

    public string? SourceSnapshotHash { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? AppliedAt { get; set; }

    public int CreditCost { get; set; }

    public ICollection<AIPlannerCreditBreakdownItem> CreditBreakdown { get; set; } = [];

    public ICollection<AIPlannerActionProposal> Actions { get; set; } = [];
}

public class AIPlannerCreditBreakdownItem
{
    public required string ActionType { get; set; }

    public int Count { get; set; }

    public double UnitCost { get; set; }

    public double Subtotal { get; set; }
}

public class AIPlannerActionProposal
{
    public required string ActionType { get; set; }

    public required string Summary { get; set; }

    public Guid? TargetWorkoutId { get; set; }

    public Guid? TargetExerciseId { get; set; }

    public string? TargetDate { get; set; }

    public string? PreviousDate { get; set; }

    public string? BeforeStateFingerprint { get; set; }

    public PlannedWorkoutRequestPayload? Workout { get; set; }
}

public class PlannedWorkoutRequestPayload
{
    public string? Name { get; set; }

    public string? Note { get; set; }

    public required string PlannedAt { get; set; }

    public ICollection<PlannedExerciseRequestPayload> Exercises { get; set; } = [];
}

public class PlannedExerciseRequestPayload
{
    public Guid? Id { get; set; }

    public Guid? ExerciseId { get; set; }

    public required string Name { get; set; }

    public string? Note { get; set; }

    public string? PrescriptionType { get; set; }

    public ICollection<AIPlannerSetOutput> Sets { get; set; } = [];
}

public static class AIPlannerProposalActionTypes
{
    public const string CreateWorkout = "create_workout";
    public const string UpdateWorkout = "update_workout";
    public const string MoveWorkout = "move_workout";
    public const string DeleteWorkout = "delete_workout";
    public const string AddExercise = "add_exercise";
    public const string UpdateExercise = "update_exercise";
    public const string DeleteExercise = "delete_exercise";
}

public static class AIPlannerProposalStatus
{
    public const string Pending = "pending";
    public const string Applied = "applied";
    public const string Discarded = "discarded";
    public const string Superseded = "superseded";
}

public static class AIPlannerProposalPricing
{
    private const int MaxCredits = 5;

    private static readonly IReadOnlyDictionary<string, double> ActionWeights =
        new Dictionary<string, double>(StringComparer.Ordinal)
        {
            [AIPlannerProposalActionTypes.CreateWorkout] = 0.5,
            [AIPlannerProposalActionTypes.UpdateWorkout] = 0.5,
            [AIPlannerProposalActionTypes.MoveWorkout] = 0.5,
            [AIPlannerProposalActionTypes.DeleteWorkout] = 0.25,
            [AIPlannerProposalActionTypes.AddExercise] = 0.25,
            [AIPlannerProposalActionTypes.UpdateExercise] = 0.25,
            [AIPlannerProposalActionTypes.DeleteExercise] = 0.25,
        };

    public static (int CreditCost, ICollection<AIPlannerCreditBreakdownItem> Breakdown) Calculate(
        IEnumerable<AIPlannerActionProposal> actions)
    {
        var breakdown = actions
            .GroupBy(action => action.ActionType)
            .Select(group =>
            {
                var unitCost = ActionWeights.GetValueOrDefault(group.Key, 0.25);
                return new AIPlannerCreditBreakdownItem
                {
                    ActionType = group.Key,
                    Count = group.Count(),
                    UnitCost = unitCost,
                    Subtotal = group.Count() * unitCost,
                };
            })
            .OrderBy(item => item.ActionType, StringComparer.Ordinal)
            .ToList();

        if (breakdown.Count == 0)
        {
            return (0, breakdown);
        }

        var rawScore = breakdown.Sum(item => item.Subtotal);
        var rounded = (int)Math.Round(rawScore, MidpointRounding.AwayFromZero);
        var creditCost = Math.Clamp(Math.Max(1, rounded), 1, MaxCredits);
        return (creditCost, breakdown);
    }
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
