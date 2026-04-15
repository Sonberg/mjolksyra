using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.UseCases.Common.Models;
using Mjolksyra.UseCases.CompletedWorkouts.AddCompletedWorkoutChatMessage;
using Mjolksyra.UseCases.CompletedWorkouts;
using Mjolksyra.UseCases.CompletedWorkouts.AnalyzeCompletedWorkoutMedia;
using Mjolksyra.UseCases.CompletedWorkouts.CreateCompletedWorkout;
using Mjolksyra.UseCases.CompletedWorkouts.GetCompletedWorkoutChatMessages;
using Mjolksyra.UseCases.CompletedWorkouts.GetLatestCompletedWorkoutMediaAnalysis;
using Mjolksyra.UseCases.CompletedWorkouts.GetWorkoutSession;
using Mjolksyra.UseCases.CompletedWorkouts.GetWorkouts;
using Mjolksyra.UseCases.CompletedWorkouts.LogWorkoutSession;
using Mjolksyra.UseCases.CompletedWorkouts.RestoreWorkoutSession;
using Mjolksyra.UseCases.CompletedWorkouts.StartWorkoutSession;
using Mjolksyra.UseCases.CompletedWorkouts.UpdateCompletedWorkoutChatMessage;
using Mjolksyra.UseCases.CompletedWorkouts.UpdateWorkoutSession;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/trainees/{traineeId:guid}/workouts")]
public class WorkoutController : Controller
{
    private readonly IMediator _mediator;

    public WorkoutController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<CompletedWorkoutResponse>>> GetWorkouts(
        Guid traineeId,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] int limit = 20,
        [FromQuery] string[]? sortBy = null,
        [FromQuery] SortOrder order = SortOrder.Asc,
        CancellationToken cancellationToken = default)
    {
        var result = await _mediator.Send(new GetWorkoutsRequest
        {
            TraineeId = traineeId,
            From = from,
            To = to,
            Cursor = null,
            Limit = limit,
            SortBy = sortBy,
            Order = order,
        }, cancellationToken);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CompletedWorkoutResponse>> GetWorkout(
        Guid traineeId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetWorkoutSessionRequest
        {
            TraineeId = traineeId,
            Id = id,
        }, cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CompletedWorkoutResponse>> StartSession(
        Guid traineeId,
        [FromBody] StartWorkoutSessionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new StartWorkoutSessionCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = request.PlannedWorkoutId,
        }, cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("ad-hoc")]
    public async Task<ActionResult<CompletedWorkoutResponse>> CreateAdHocWorkout(
        Guid traineeId,
        [FromBody] CreateCompletedWorkoutRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreateCompletedWorkoutCommand
        {
            TraineeId = traineeId,
            Workout = request,
        }, cancellationToken);

        return result is null ? Forbid() : Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<CompletedWorkoutResponse>> UpdateSession(
        Guid traineeId,
        Guid id,
        [FromBody] UpdateWorkoutSessionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateWorkoutSessionCommand
        {
            TraineeId = traineeId,
            Id = id,
            Session = request,
        }, cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{id:guid}/log")]
    public async Task<ActionResult<CompletedWorkoutResponse>> LogSession(
        Guid traineeId,
        Guid id,
        [FromBody] LogWorkoutSessionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new LogWorkoutSessionCommand
        {
            TraineeId = traineeId,
            Id = id,
            Log = request,
        }, cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{id:guid}/restore")]
    public async Task<ActionResult<CompletedWorkoutResponse>> RestoreSession(
        Guid traineeId,
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new RestoreWorkoutSessionCommand
        {
            TraineeId = traineeId,
            Id = id,
        }, cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("{completedWorkoutId:guid}/chat-messages")]
    public async Task<ActionResult<ICollection<CompletedWorkoutChatMessageResponse>>> GetChatMessages(
        Guid traineeId,
        Guid completedWorkoutId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetCompletedWorkoutChatMessagesRequest
        {
            TraineeId = traineeId,
            CompletedWorkoutId = completedWorkoutId,
        }, cancellationToken);

        return Ok(result);
    }

    [HttpPost("{completedWorkoutId:guid}/chat-messages")]
    public async Task<ActionResult<CompletedWorkoutChatMessageResponse>> AddChatMessage(
        Guid traineeId,
        Guid completedWorkoutId,
        [FromBody] CompletedWorkoutChatMessageRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new AddCompletedWorkoutChatMessageCommand
        {
            TraineeId = traineeId,
            CompletedWorkoutId = completedWorkoutId,
            Message = request,
        }, cancellationToken);

        return result is null ? Forbid() : Ok(result);
    }

    [HttpPatch("{completedWorkoutId:guid}/chat-messages/{chatMessageId:guid}")]
    public async Task<ActionResult<CompletedWorkoutChatMessageResponse>> UpdateChatMessage(
        Guid traineeId,
        Guid completedWorkoutId,
        Guid chatMessageId,
        [FromBody] CompletedWorkoutChatMessageEditRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateCompletedWorkoutChatMessageCommand
        {
            TraineeId = traineeId,
            CompletedWorkoutId = completedWorkoutId,
            ChatMessageId = chatMessageId,
            Message = request,
        }, cancellationToken);

        return result is null ? Forbid() : Ok(result);
    }

    [HttpPost("{completedWorkoutId:guid}/analysis")]
    public async Task<ActionResult<CompletedWorkoutMediaAnalysisResponse>> Analyze(
        Guid traineeId,
        Guid completedWorkoutId,
        [FromBody] CompletedWorkoutMediaAnalysisRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new AnalyzeCompletedWorkoutMediaCommand
        {
            TraineeId = traineeId,
            CompletedWorkoutId = completedWorkoutId,
            Analysis = request,
        }, cancellationToken);

        return result.Match<ActionResult<CompletedWorkoutMediaAnalysisResponse>>(
            success => Ok(success),
            _ => Forbid(),
            insufficient => UnprocessableEntity(new { error = insufficient.Reason }));
    }

    [HttpGet("{completedWorkoutId:guid}/analysis/latest")]
    public async Task<ActionResult<CompletedWorkoutMediaAnalysisResponse>> GetLatestAnalysis(
        Guid traineeId,
        Guid completedWorkoutId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetLatestCompletedWorkoutMediaAnalysisRequest
        {
            TraineeId = traineeId,
            CompletedWorkoutId = completedWorkoutId,
        }, cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }
}
