using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.PreviewWorkoutPlan;

namespace Mjolksyra.UseCases.PlannedWorkouts.GetLatestPlannerSession;

public class GetLatestPlannerSessionQueryHandler(
    IPlannerSessionRepository sessionRepository,
    ITraineeRepository traineeRepository,
    IUserContext userContext) : IRequestHandler<GetLatestPlannerSessionQuery, GetLatestPlannerSessionResponse?>
{
    public async Task<GetLatestPlannerSessionResponse?> Handle(
        GetLatestPlannerSessionQuery request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        var trainee = await traineeRepository.GetById(request.TraineeId, cancellationToken);
        if (trainee is null || trainee.CoachUserId != userId)
        {
            return null;
        }

        var session = await sessionRepository.GetLatestByTrainee(request.TraineeId, userId, cancellationToken);
        if (session is null)
        {
            return null;
        }

        if (session.ProposedActionSet is { CreditCost: <= 0, Actions.Count: > 0 } proposal)
        {
            var pricing = AIPlannerProposalPricing.Calculate(proposal.Actions);
            proposal.CreditCost = pricing.CreditCost;
            proposal.CreditBreakdown = pricing.Breakdown;
        }

        return new GetLatestPlannerSessionResponse
        {
            SessionId = session.Id,
            Description = session.Description,
            ConversationHistory = session.ConversationHistory,
            SuggestedParams = session.SuggestedParams,
            ProposedActionSet = session.ProposedActionSet,
            PreviewWorkouts = PreviewWorkoutPlanMapper.FromOutputs(session.PreviewWorkouts),
            GenerationResult = session.GenerationResult,
        };
    }
}
