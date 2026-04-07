using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Api.Common.UserEvents;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.ApplyAIPlannerProposal;
using Mjolksyra.UseCases.PlannedWorkouts.ClarifyWorkoutPlan;
using Mjolksyra.UseCases.PlannedWorkouts.DeletePlannerSession;
using Mjolksyra.UseCases.PlannedWorkouts.DiscardAIPlannerProposal;
using Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;
using Mjolksyra.UseCases.PlannedWorkouts.GetLatestPlannerSession;
using Mjolksyra.UseCases.PlannedWorkouts.PreviewWorkoutPlan;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/trainees/{traineeId:guid}/ai-planner")]
public class AIWorkoutPlannerController(
    IMediator mediator,
    IUserEventPublisher userEventPublisher,
    IUserContext userContext) : Controller
{
    [HttpGet("session/latest")]
    public async Task<ActionResult<GetLatestPlannerSessionResponse>> GetLatestSession(
        Guid traineeId,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetLatestPlannerSessionQuery
        {
            TraineeId = traineeId,
        }, cancellationToken);

        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpPost("clarify")]
    public async Task<ActionResult<ClarifyWorkoutPlanResponse>> Clarify(
        Guid traineeId,
        [FromBody] ClarifyWorkoutPlanRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ClarifyWorkoutPlanQuery
        {
            TraineeId = traineeId,
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
    public async Task<ActionResult<ApplyAIPlannerProposalResponse>> ApplyProposal(
        Guid traineeId,
        Guid proposalId,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ApplyAIPlannerProposalCommand
        {
            TraineeId = traineeId,
            ProposalId = proposalId,
        }, cancellationToken);

        return await result.Match<Task<ActionResult<ApplyAIPlannerProposalResponse>>>(
            async success =>
            {
                if (await userContext.GetUserId(cancellationToken) is { } userId)
                {
                    await userEventPublisher.Publish(
                        userId,
                        "planned-workouts.updated",
                        new { traineeId },
                        cancellationToken);
                }

                return Ok(success);
            },
            _ => Task.FromResult<ActionResult<ApplyAIPlannerProposalResponse>>(Forbid()),
            conflict => Task.FromResult<ActionResult<ApplyAIPlannerProposalResponse>>(
                Conflict(new { error = conflict.Reason })));
    }

    [HttpPost("proposals/{proposalId:guid}/discard")]
    public async Task<ActionResult> DiscardProposal(
        Guid traineeId,
        Guid proposalId,
        CancellationToken cancellationToken)
    {
        var discarded = await mediator.Send(new DiscardAIPlannerProposalCommand
        {
            TraineeId = traineeId,
            ProposalId = proposalId,
        }, cancellationToken);

        return discarded ? NoContent() : Forbid();
    }

    [HttpDelete("session/{sessionId:guid}")]
    public async Task<ActionResult> DeleteSession(
        Guid traineeId,
        Guid sessionId,
        CancellationToken cancellationToken)
    {
        var deleted = await mediator.Send(new DeletePlannerSessionCommand
        {
            TraineeId = traineeId,
            SessionId = sessionId,
        }, cancellationToken);

        return deleted ? NoContent() : Forbid();
    }

    [HttpPost("preview")]
    public async Task<ActionResult<PreviewWorkoutPlanResponse>> Preview(
        Guid traineeId,
        [FromBody] PreviewWorkoutPlanRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new PreviewWorkoutPlanQuery
        {
            TraineeId = traineeId,
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
            Params = new PreviewWorkoutPlanParams
            {
                StartDate = request.Params.StartDate,
                NumberOfWeeks = request.Params.NumberOfWeeks,
                ConflictStrategy = request.Params.ConflictStrategy,
            },
        }, cancellationToken);

        if (result is null)
        {
            return Forbid();
        }

        return Ok(result);
    }

    [HttpPost("generate")]
    public async Task<ActionResult<GenerateWorkoutPlanResponse>> Generate(
        Guid traineeId,
        [FromBody] GenerateWorkoutPlanRequest request,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GenerateWorkoutPlanCommand
        {
            TraineeId = traineeId,
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
            Params = new GenerateWorkoutPlanParams
            {
                StartDate = request.Params.StartDate,
                NumberOfWeeks = request.Params.NumberOfWeeks,
                ConflictStrategy = request.Params.ConflictStrategy,
            },
        }, cancellationToken);

        return await result.Match<Task<ActionResult<GenerateWorkoutPlanResponse>>>(
            async success =>
            {
                if (await userContext.GetUserId(cancellationToken) is { } userId)
                {
                    await userEventPublisher.Publish(
                        userId,
                        "planned-workouts.updated",
                        new { traineeId },
                        cancellationToken);
                }
                return Ok(success);
            },
            _ => Task.FromResult<ActionResult<GenerateWorkoutPlanResponse>>(Forbid()),
            insufficient => Task.FromResult<ActionResult<GenerateWorkoutPlanResponse>>(
                UnprocessableEntity(new { error = insufficient.Reason })));
    }
}

public class ClarifyWorkoutPlanRequest
{
    public Guid? SessionId { get; set; }

    public required string Description { get; set; }

    public ICollection<PlannerFileContentDto> FilesContent { get; set; } = [];

    public ICollection<PlannerConversationMessageDto> ConversationHistory { get; set; } = [];
}

public class GenerateWorkoutPlanRequest
{
    public Guid? SessionId { get; set; }

    public required string Description { get; set; }

    public ICollection<PlannerFileContentDto> FilesContent { get; set; } = [];

    public ICollection<PlannerConversationMessageDto> ConversationHistory { get; set; } = [];

    public required GenerateWorkoutPlanParamsDto Params { get; set; }
}

public class GenerateWorkoutPlanParamsDto
{
    public required string StartDate { get; set; }

    public int NumberOfWeeks { get; set; }

    public string ConflictStrategy { get; set; } = "Skip";
}

public class PreviewWorkoutPlanRequest
{
    public required string Description { get; set; }

    public ICollection<PlannerFileContentDto> FilesContent { get; set; } = [];

    public ICollection<PlannerConversationMessageDto> ConversationHistory { get; set; } = [];

    public required GenerateWorkoutPlanParamsDto Params { get; set; }
}

public class PlannerFileContentDto
{
    public required string Name { get; set; }

    public required string Type { get; set; }

    public required string Content { get; set; }
}

public class PlannerConversationMessageDto
{
    public required string Role { get; set; }

    public required string Content { get; set; }
}
