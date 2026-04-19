using MediatR;
using Mjolksyra.Domain.AI;

namespace Mjolksyra.UseCases.Blocks.Planner.GetLatestBlockPlannerSession;

public class GetLatestBlockPlannerSessionQuery : IRequest<GetLatestBlockPlannerSessionResponse?>
{
    public required Guid BlockId { get; set; }
}

public class GetLatestBlockPlannerSessionResponse
{
    public required Guid SessionId { get; set; }

    public required string Description { get; set; }

    public ICollection<BlockPlannerSessionMessageDto> ConversationHistory { get; set; } = [];

    public BlockPlannerActionSet? ProposedActionSet { get; set; }
}

public class BlockPlannerSessionMessageDto
{
    public required string Role { get; set; }

    public required string Content { get; set; }

    public ICollection<string> Options { get; set; } = [];
}
