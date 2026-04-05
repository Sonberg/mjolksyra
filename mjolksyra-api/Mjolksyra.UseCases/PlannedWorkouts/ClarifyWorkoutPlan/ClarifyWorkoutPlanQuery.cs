using MediatR;
using Mjolksyra.Domain.AI;

namespace Mjolksyra.UseCases.PlannedWorkouts.ClarifyWorkoutPlan;

public class ClarifyWorkoutPlanQuery : IRequest<ClarifyWorkoutPlanResponse?>
{
    public required Guid TraineeId { get; set; }

    public required string Description { get; set; }

    public ICollection<AIPlannerFileContent> FilesContent { get; set; } = [];

    public ICollection<AIPlannerConversationMessage> ConversationHistory { get; set; } = [];
}

public class ClarifyWorkoutPlanResponse
{
    public required string Message { get; set; }

    public bool IsReadyToGenerate { get; set; }

    public ClarifyWorkoutPlanSuggestedParams? SuggestedParams { get; set; }
}

public class ClarifyWorkoutPlanSuggestedParams
{
    public required string StartDate { get; set; }

    public int NumberOfWeeks { get; set; }

    public string ConflictStrategy { get; set; } = "Skip";
}
