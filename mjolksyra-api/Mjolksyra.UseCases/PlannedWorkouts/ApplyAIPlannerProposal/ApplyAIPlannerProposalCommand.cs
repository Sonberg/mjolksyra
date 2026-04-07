using MediatR;
using OneOf;

namespace Mjolksyra.UseCases.PlannedWorkouts.ApplyAIPlannerProposal;

public class ApplyAIPlannerProposalCommand : IRequest<OneOf<ApplyAIPlannerProposalResponse, ApplyAIPlannerProposalForbidden, ApplyAIPlannerProposalConflict, ApplyAIPlannerProposalInsufficientCredits>>
{
    public required Guid TraineeId { get; set; }

    public required Guid ProposalId { get; set; }
}

public class ApplyAIPlannerProposalResponse
{
    public required Guid SessionId { get; set; }

    public required Guid ProposalId { get; set; }

    public int ActionsApplied { get; set; }

    public required string Summary { get; set; }

    public ICollection<Guid> WorkoutIds { get; set; } = [];
}

public class ApplyAIPlannerProposalForbidden
{
}

public class ApplyAIPlannerProposalConflict
{
    public ApplyAIPlannerProposalConflict(string reason)
    {
        Reason = reason;
    }

    public string Reason { get; }
}

public class ApplyAIPlannerProposalInsufficientCredits
{
    public ApplyAIPlannerProposalInsufficientCredits(string reason)
    {
        Reason = reason;
    }

    public string Reason { get; }
}
