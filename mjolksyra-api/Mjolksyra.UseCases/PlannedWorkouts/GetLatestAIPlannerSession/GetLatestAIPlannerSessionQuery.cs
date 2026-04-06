using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetLatestAIPlannerSession;

public class GetLatestAIPlannerSessionQuery : IRequest<GetLatestAIPlannerSessionResponse?>
{
    public required Guid TraineeId { get; set; }
}

public class GetLatestAIPlannerSessionResponse
{
    public required Guid SessionId { get; set; }

    public required string Description { get; set; }

    public ICollection<AIPlannerSessionMessage> ConversationHistory { get; set; } = [];

    public AIPlannerSuggestedParams? SuggestedParams { get; set; }

    public AIPlannerSessionGenerationResult? GenerationResult { get; set; }
}
