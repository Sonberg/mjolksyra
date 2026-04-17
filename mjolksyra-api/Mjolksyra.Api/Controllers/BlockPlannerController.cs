using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Api.Common.UserEvents;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Blocks.Planner.ApplyBlockPlannerProposal;
using Mjolksyra.UseCases.Blocks.Planner.ClarifyBlockPlan;
using Mjolksyra.UseCases.Blocks.Planner.DeleteBlockPlannerSession;
using Mjolksyra.UseCases.Blocks.Planner.DiscardBlockPlannerProposal;
using Mjolksyra.UseCases.Blocks.Planner.GetLatestBlockPlannerSession;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/blocks/{blockId:guid}/planner")]
public class BlockPlannerController(
    IMediator mediator,
    IUserEventPublisher userEventPublisher,
    IUserContext userContext) : Controller
{
    [HttpGet("session/latest")]
    public async Task<ActionResult<GetLatestBlockPlannerSessionResponse>> GetLatestSession(
        Guid blockId,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetLatestBlockPlannerSessionQuery
        {
            BlockId = blockId,
        }, cancellationToken);

        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpPost("clarify")]
    public async Task<ActionResult<ClarifyBlockPlanResponse>> Clarify(
        Guid blockId,
        [FromBody] BlockPlannerClarifyRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ClarifyBlockPlanQuery
        {
            BlockId = blockId,
            SessionId = request.SessionId,
            Description = request.Description,
            FilesContent = request.FilesContent.Select(f => new AIPlannerFileContent
            {
                Name = f.Name,
                Type = f.Type,
                Content = f.Content,
            }).ToList(),
            ConversationHistory = request.ConversationHistory.Select(m => new AIPlannerConversationMessage
            {
                Role = m.Role,
                Content = m.Content,
            }).ToList(),
        }, cancellationToken);

        if (result is null)
        {
            return Forbid();
        }

        return Ok(result);
    }

    [HttpPost("proposals/{proposalId:guid}/apply")]
    public async Task<ActionResult<ApplyBlockPlannerProposalResponse>> ApplyProposal(
        Guid blockId,
        Guid proposalId,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ApplyBlockPlannerProposalCommand
        {
            BlockId = blockId,
            ProposalId = proposalId,
        }, cancellationToken);

        return await result.Match<Task<ActionResult<ApplyBlockPlannerProposalResponse>>>(
            async success =>
            {
                if (await userContext.GetUserId(cancellationToken) is { } userId)
                {
                    await userEventPublisher.Publish(
                        userId,
                        "blocks.updated",
                        new { blockId },
                        cancellationToken);
                }

                return Ok(success);
            },
            _ => Task.FromResult<ActionResult<ApplyBlockPlannerProposalResponse>>(Forbid()),
            insufficient => Task.FromResult<ActionResult<ApplyBlockPlannerProposalResponse>>(
                UnprocessableEntity(new { error = insufficient.Reason })));
    }

    [HttpPost("proposals/{proposalId:guid}/discard")]
    public async Task<ActionResult> DiscardProposal(
        Guid blockId,
        Guid proposalId,
        CancellationToken cancellationToken)
    {
        var discarded = await mediator.Send(new DiscardBlockPlannerProposalCommand
        {
            BlockId = blockId,
            ProposalId = proposalId,
        }, cancellationToken);

        return discarded ? NoContent() : Forbid();
    }

    [HttpDelete("session/{sessionId:guid}")]
    public async Task<ActionResult> DeleteSession(
        Guid blockId,
        Guid sessionId,
        CancellationToken cancellationToken)
    {
        var deleted = await mediator.Send(new DeleteBlockPlannerSessionCommand
        {
            BlockId = blockId,
            SessionId = sessionId,
        }, cancellationToken);

        return deleted ? NoContent() : Forbid();
    }
}

public class BlockPlannerClarifyRequest
{
    public Guid? SessionId { get; set; }

    public required string Description { get; set; }

    public ICollection<PlannerFileContentDto> FilesContent { get; set; } = [];

    public ICollection<PlannerConversationMessageDto> ConversationHistory { get; set; } = [];
}
