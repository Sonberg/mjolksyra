using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database.Common;

namespace Mjolksyra.Domain.Database.Models;

public class BlockPlannerSession : IDocument
{
    public Guid Id { get; set; }

    public Guid BlockId { get; set; }

    public Guid CoachUserId { get; set; }

    public required string Description { get; set; }

    public ICollection<PlannerSessionMessage> ConversationHistory { get; set; } = [];

    public BlockPlannerActionSet? ProposedActionSet { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }
}
