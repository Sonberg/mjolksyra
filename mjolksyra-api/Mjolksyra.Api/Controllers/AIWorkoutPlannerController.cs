using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Api.Common.UserEvents;
using Mjolksyra.Domain.AI;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.PlannedWorkouts.ClarifyWorkoutPlan;
using Mjolksyra.UseCases.PlannedWorkouts.GenerateWorkoutPlan;
using Mjolksyra.UseCases.PlannedWorkouts.GetLatestAIPlannerSession;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/trainees/{traineeId:guid}/ai-planner")]
public class AIWorkoutPlannerController(
    IMediator mediator,
    IUserEventPublisher userEventPublisher,
    IUserContext userContext) : Controller
{
    [HttpGet("session/latest")]
    public async Task<ActionResult<GetLatestAIPlannerSessionResponse>> GetLatestSession(
        Guid traineeId,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetLatestAIPlannerSessionQuery
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

        if (result is null)
        {
            return Forbid();
        }

        if (await userContext.GetUserId(cancellationToken) is { } userId)
        {
            await userEventPublisher.Publish(
                userId,
                "planned-workouts.updated",
                new { traineeId },
                cancellationToken);
        }

        return Ok(result);
    }
}

public class ClarifyWorkoutPlanRequest
{
    public Guid? SessionId { get; set; }

    public required string Description { get; set; }

    public ICollection<AIPlannerFileContentDto> FilesContent { get; set; } = [];

    public ICollection<AIPlannerConversationMessageDto> ConversationHistory { get; set; } = [];
}

public class GenerateWorkoutPlanRequest
{
    public Guid? SessionId { get; set; }

    public required string Description { get; set; }

    public ICollection<AIPlannerFileContentDto> FilesContent { get; set; } = [];

    public ICollection<AIPlannerConversationMessageDto> ConversationHistory { get; set; } = [];

    public required GenerateWorkoutPlanParamsDto Params { get; set; }
}

public class GenerateWorkoutPlanParamsDto
{
    public required string StartDate { get; set; }

    public int NumberOfWeeks { get; set; }

    public string ConflictStrategy { get; set; } = "Skip";
}

public class AIPlannerFileContentDto
{
    public required string Name { get; set; }

    public required string Type { get; set; }

    public required string Content { get; set; }
}

public class AIPlannerConversationMessageDto
{
    public required string Role { get; set; }

    public required string Content { get; set; }
}
