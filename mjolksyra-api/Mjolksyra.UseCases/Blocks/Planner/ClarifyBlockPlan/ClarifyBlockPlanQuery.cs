using MediatR;
using Mjolksyra.Domain.AI;

namespace Mjolksyra.UseCases.Blocks.Planner.ClarifyBlockPlan;

public class ClarifyBlockPlanQuery : IRequest<ClarifyBlockPlanResponse?>
{
    public required Guid BlockId { get; set; }

    public Guid? SessionId { get; set; }

    public required string Description { get; set; }

    public ICollection<AIPlannerFileContent> FilesContent { get; set; } = [];

    public ICollection<AIPlannerConversationMessage> ConversationHistory { get; set; } = [];
}

public class ClarifyBlockPlanResponse
{
    public required Guid SessionId { get; set; }

    public required string Message { get; set; }

    public bool IsReadyToApply { get; set; }

    public bool RequiresApproval { get; set; }

    public BlockPlannerActionSet? ProposedActionSet { get; set; }

    public ICollection<string> Options { get; set; } = [];
}
