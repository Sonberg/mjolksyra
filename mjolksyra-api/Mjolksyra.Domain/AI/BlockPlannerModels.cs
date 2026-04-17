namespace Mjolksyra.Domain.AI;

public class BlockPlannerClarifyInput
{
    public required string Description { get; set; }

    public ICollection<AIPlannerFileContent> FilesContent { get; set; } = [];

    public ICollection<AIPlannerConversationMessage> ConversationHistory { get; set; } = [];

    public required IBlockPlannerToolDispatcher ToolDispatcher { get; set; }
}

public class BlockPlannerClarifyOutput
{
    public required string Message { get; set; }

    public bool IsReadyToApply { get; set; }

    public bool RequiresApproval { get; set; }

    public BlockPlannerActionSet? ProposedActionSet { get; set; }

    public ICollection<string> Options { get; set; } = [];
}

public class BlockPlannerActionSet
{
    public Guid Id { get; set; }

    public string Status { get; set; } = AIPlannerProposalStatus.Pending;

    public required string Summary { get; set; }

    public string? Explanation { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset? AppliedAt { get; set; }

    public int CreditCost { get; set; }

    public ICollection<AIPlannerCreditBreakdownItem> CreditBreakdown { get; set; } = [];

    public ICollection<BlockPlannerActionProposal> Actions { get; set; } = [];
}

public class BlockPlannerActionProposal
{
    public required string ActionType { get; set; }

    public required string Summary { get; set; }

    public Guid? TargetWorkoutId { get; set; }

    public Guid? TargetExerciseId { get; set; }

    public int? TargetWeek { get; set; }

    public int? TargetDayOfWeek { get; set; }

    public int? PreviousWeek { get; set; }

    public int? PreviousDayOfWeek { get; set; }

    public BlockWorkoutRequestPayload? Workout { get; set; }
}

public class BlockWorkoutRequestPayload
{
    public string? Name { get; set; }

    public string? Note { get; set; }

    public int Week { get; set; }

    public int DayOfWeek { get; set; }

    public ICollection<PlannedExerciseRequestPayload> Exercises { get; set; } = [];
}

public static class BlockPlannerProposalActionTypes
{
    public const string CreateBlockWorkout = "create_block_workout";
    public const string UpdateBlockWorkout = "update_block_workout";
    public const string DeleteBlockWorkout = "delete_block_workout";
    public const string AddBlockExercise = "add_block_exercise";
    public const string UpdateBlockExercise = "update_block_exercise";
    public const string DeleteBlockExercise = "delete_block_exercise";
}
