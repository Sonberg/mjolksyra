using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.PlannedWorkouts.DiscardAIPlannerProposal;

public class DiscardAIPlannerProposalCommandHandler(
    IPlannerSessionRepository sessionRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<DiscardAIPlannerProposalCommand, bool>
{
    public async Task<bool> Handle(DiscardAIPlannerProposalCommand request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return false;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return false;
        }

        var session = await sessionRepository.GetByProposalId(request.ProposalId, userId, cancellationToken);
        if (session is null || session.TraineeId != request.TraineeId || session.ProposedActionSet is null)
        {
            return false;
        }

        session.ProposedActionSet.Status = AIPlannerProposalStatus.Discarded;
        session.UpdatedAt = DateTimeOffset.UtcNow;
        await sessionRepository.Update(session, cancellationToken);
        return true;
    }
}
