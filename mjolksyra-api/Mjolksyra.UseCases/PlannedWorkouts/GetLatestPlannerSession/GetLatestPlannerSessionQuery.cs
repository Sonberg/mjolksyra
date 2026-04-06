using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetLatestPlannerSession;

public class GetLatestPlannerSessionQuery : IRequest<GetLatestPlannerSessionResponse?>
{
    public required Guid TraineeId { get; set; }
}

public class GetLatestPlannerSessionResponse
{
    public required Guid SessionId { get; set; }

    public required string Description { get; set; }

    public ICollection<PlannerSessionMessage> ConversationHistory { get; set; } = [];

    public AIPlannerSuggestedParams? SuggestedParams { get; set; }

    public PlannerSessionGenerationResult? GenerationResult { get; set; }
}
