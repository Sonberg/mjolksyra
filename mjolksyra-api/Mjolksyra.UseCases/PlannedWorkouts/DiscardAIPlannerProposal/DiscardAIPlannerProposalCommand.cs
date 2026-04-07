using MediatR;

namespace Mjolksyra.UseCases.PlannedWorkouts.DiscardAIPlannerProposal;

public class DiscardAIPlannerProposalCommand : IRequest<bool>
{
    public required Guid TraineeId { get; set; }

    public required Guid ProposalId { get; set; }
}
