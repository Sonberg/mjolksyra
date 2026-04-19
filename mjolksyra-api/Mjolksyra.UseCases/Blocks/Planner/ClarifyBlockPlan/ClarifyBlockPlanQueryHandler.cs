using MediatR;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Blocks.Planner.ClarifyBlockPlan;

public class ClarifyBlockPlanQueryHandler(
    IBlockPlannerAgent plannerAgent,
    IBlockRepository blockRepository,
    IExerciseRepository exerciseRepository,
    ITraineeInsightsRepository traineeInsightsRepository,
    IBlockPlannerSessionRepository sessionRepository,
    IUserContext userContext) : IRequestHandler<ClarifyBlockPlanQuery, ClarifyBlockPlanResponse?>
{
    public async Task<ClarifyBlockPlanResponse?> Handle(ClarifyBlockPlanQuery request, CancellationToken cancellationToken)
    {
        if (await userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return null;
        }

        var block = await blockRepository.Get(request.BlockId, cancellationToken);
        if (block is null || block.CoachId != userId)
        {
            return null;
        }

        var toolDispatcher = new BlockPlannerToolDispatcher(
            blockRepository,
            exerciseRepository,
            traineeInsightsRepository,
            request.BlockId);

        var output = await plannerAgent.ClarifyAsync(new BlockPlannerClarifyInput
        {
            Description = request.Description,
            FilesContent = request.FilesContent,
            ConversationHistory = request.ConversationHistory,
            ToolDispatcher = toolDispatcher,
        }, cancellationToken);

        var now = DateTimeOffset.UtcNow;

        BlockPlannerSession session;
        if (request.SessionId.HasValue)
        {
            session = await sessionRepository.GetById(request.SessionId.Value, cancellationToken)
                      ?? CreateSession(request.BlockId, userId, request.Description, now);

            if (session.Id != Guid.Empty &&
                (session.BlockId != request.BlockId || session.CoachUserId != userId))
            {
                return null;
            }
        }
        else
        {
            session = CreateSession(request.BlockId, userId, request.Description, now);
        }

        session.ConversationHistory = request.ConversationHistory
            .Select(m => new PlannerSessionMessage { Role = m.Role, Content = m.Content })
            .Append(new PlannerSessionMessage
            {
                Role = "assistant",
                Content = output.Message,
                Options = output.Options.ToList(),
            })
            .ToList();

        session.ProposedActionSet = NormalizeProposal(output.ProposedActionSet, now);
        session.UpdatedAt = now;

        if (session.Id == Guid.Empty)
        {
            session.Id = Guid.NewGuid();
            await sessionRepository.Create(session, cancellationToken);
        }
        else
        {
            await sessionRepository.Update(session, cancellationToken);
        }

        return new ClarifyBlockPlanResponse
        {
            SessionId = session.Id,
            Message = output.Message,
            IsReadyToApply = output.IsReadyToApply && session.ProposedActionSet is not null,
            RequiresApproval = output.RequiresApproval || session.ProposedActionSet is not null,
            Options = output.Options,
            ProposedActionSet = session.ProposedActionSet,
        };
    }

    private static BlockPlannerActionSet? NormalizeProposal(BlockPlannerActionSet? proposal, DateTimeOffset now)
    {
        if (proposal is null || proposal.Actions.Count == 0)
        {
            return null;
        }

        var normalized = new BlockPlannerActionSet
        {
            Id = Guid.NewGuid(),
            Status = AIPlannerProposalStatus.Pending,
            Summary = proposal.Summary,
            Explanation = proposal.Explanation,
            CreatedAt = now,
            Actions = proposal.Actions.Select(a => new BlockPlannerActionProposal
            {
                ActionType = a.ActionType,
                Summary = a.Summary,
                TargetWorkoutId = a.TargetWorkoutId,
                TargetExerciseId = a.TargetExerciseId,
                TargetWeek = a.TargetWeek ?? a.Workout?.Week,
                TargetDayOfWeek = a.TargetDayOfWeek ?? a.Workout?.DayOfWeek,
                PreviousWeek = a.PreviousWeek,
                PreviousDayOfWeek = a.PreviousDayOfWeek,
                Workout = a.Workout,
            }).ToList(),
        };

        var pricing = AIPlannerProposalPricing.Calculate(
            normalized.Actions.Select(a => new AIPlannerActionProposal
            {
                ActionType = a.ActionType,
                Summary = a.Summary,
            }));

        normalized.CreditCost = pricing.CreditCost;
        normalized.CreditBreakdown = pricing.Breakdown;

        return normalized;
    }

    private static BlockPlannerSession CreateSession(Guid blockId, Guid coachUserId, string description, DateTimeOffset now)
        => new()
        {
            Id = Guid.Empty,
            BlockId = blockId,
            CoachUserId = coachUserId,
            Description = description,
            CreatedAt = now,
            UpdatedAt = now,
        };
}
