using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.UseCases.PlannedWorkouts.PreviewWorkoutPlan;

namespace Mjolksyra.UseCases.PlannedWorkouts.ClarifyWorkoutPlan;

public class ClarifyWorkoutPlanQuery : IRequest<ClarifyWorkoutPlanResponse?>
{
    public required Guid TraineeId { get; set; }

    public Guid? SessionId { get; set; }

    public required string Description { get; set; }

    public ICollection<AIPlannerFileContent> FilesContent { get; set; } = [];

    public ICollection<AIPlannerConversationMessage> ConversationHistory { get; set; } = [];
}

public class ClarifyWorkoutPlanResponse
{
    public required string Message { get; set; }

    public bool IsReadyToGenerate { get; set; }

    public bool IsReadyToApply { get; set; }

    public bool RequiresApproval { get; set; }

    public ClarifyWorkoutPlanSuggestedParams? SuggestedParams { get; set; }

    public AIPlannerActionSet? ProposedActionSet { get; set; }

    public ICollection<PreviewWorkoutPlanWorkout> PreviewWorkouts { get; set; } = [];

    public ICollection<string> Options { get; set; } = [];

    public required Guid SessionId { get; set; }
}

public class ClarifyWorkoutPlanSuggestedParams
{
    public required string StartDate { get; set; }

    public int NumberOfWeeks { get; set; }

    public string ConflictStrategy { get; set; } = "Skip";
}
