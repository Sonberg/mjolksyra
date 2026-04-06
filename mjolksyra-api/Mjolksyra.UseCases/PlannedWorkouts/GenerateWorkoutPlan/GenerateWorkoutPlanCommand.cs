using MediatR;
using Mjolksyra.Domain.AI;
using OneOf;

namespace Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;

public class GenerateWorkoutPlanCommand : IRequest<OneOf<GenerateWorkoutPlanResponse, GenerateWorkoutPlanForbidden, GenerateWorkoutPlanInsufficientCredits>>
{
    public required Guid TraineeId { get; set; }

    public Guid? SessionId { get; set; }

    public required string Description { get; set; }

    public ICollection<AIPlannerFileContent> FilesContent { get; set; } = [];

    public ICollection<AIPlannerConversationMessage> ConversationHistory { get; set; } = [];

    public required GenerateWorkoutPlanParams Params { get; set; }
}

public class GenerateWorkoutPlanParams
{
    public required string StartDate { get; set; }

    public int NumberOfWeeks { get; set; }

    public string ConflictStrategy { get; set; } = "Skip";
}

public class GenerateWorkoutPlanResponse
{
    public int WorkoutsCreated { get; set; }

    public required string Summary { get; set; }

    public required string DateFrom { get; set; }

    public required string DateTo { get; set; }
}

public record GenerateWorkoutPlanForbidden;

public record GenerateWorkoutPlanInsufficientCredits(string Reason);
