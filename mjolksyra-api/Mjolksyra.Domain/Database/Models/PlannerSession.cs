using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database.Common;

namespace Mjolksyra.Domain.Database.Models;

public class PlannerSession : IDocument
{
    public Guid Id { get; set; }

    public Guid TraineeId { get; set; }

    public Guid CoachUserId { get; set; }

    public required string Description { get; set; }

    public ICollection<PlannerSessionMessage> ConversationHistory { get; set; } = [];

    public ICollection<WorkoutAnalysisToolCall> ToolCalls { get; set; } = [];

    public AIPlannerSuggestedParams? SuggestedParams { get; set; }

    public AIPlannerActionSet? ProposedActionSet { get; set; }

    public ICollection<AIPlannerWorkoutOutput> PreviewWorkouts { get; set; } = [];

    public PlannerSessionGenerationResult? GenerationResult { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}

public class PlannerSessionMessage
{
    public required string Role { get; set; }

    public required string Content { get; set; }

    public ICollection<string> Options { get; set; } = [];
}

public class PlannerSessionGenerationResult
{
    public int ActionsApplied { get; set; }

    public required string Summary { get; set; }

    public required string DateFrom { get; set; }

    public required string DateTo { get; set; }

    public DateTimeOffset GeneratedAt { get; set; }
}
