using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Api.Common.UserEvents;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Common.Models;
using Mjolksyra.UseCases.PlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.CreatePlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.DeletePlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkoutChatMessages;
using Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.LogPlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkoutChatMessage;
using Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.AddPlannedWorkoutChatMessage;
using Mjolksyra.UseCases.PlannedWorkouts.AnalyzeWorkoutMedia;
using Mjolksyra.UseCases.PlannedWorkouts.GetLatestWorkoutMediaAnalysis;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/trainees/{traineeId:guid}/planned-workouts")]
public class PlannedWorkoutsController : Controller
{
    private readonly IMediator _mediator;
    private readonly IUserEventPublisher _userEventPublisher;
    private readonly IUserContext _userContext;

    public PlannedWorkoutsController(IMediator mediator, IUserEventPublisher userEventPublisher, IUserContext userContext)
    {
        _mediator = mediator;
        _userEventPublisher = userEventPublisher;
        _userContext = userContext;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<PlannedWorkoutResponse>>> Get(
        Guid traineeId,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] string? next,
        [FromQuery] int limit,
        [FromQuery] string[] sortBy,
        [FromQuery] SortOrder order,
        CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(
            CreateGetRequest(traineeId, from, to, next, limit, sortBy, order, draftOnly: false),
            cancellationToken));
    }

    [HttpGet("/api/trainees/{traineeId:guid}/planned-exercises/draft")]
    public async Task<ActionResult<PaginatedResponse<PlannedWorkoutResponse>>> GetDraftExercises(
        Guid traineeId,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        [FromQuery] string? next,
        [FromQuery] int limit,
        [FromQuery] string[] sortBy,
        [FromQuery] SortOrder order,
        CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(
            CreateGetRequest(traineeId, from, to, next, limit, sortBy, order, draftOnly: true),
            cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<PlannedWorkoutResponse>> Create(Guid traineeId, [FromBody] PlannedWorkoutRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new CreatePlannedWorkoutCommand
        {
            TraineeId = traineeId,
            Workout = request
        }, cancellationToken);

        var userId = await _userContext.GetUserId(cancellationToken);
        if (userId.HasValue)
        {
            await _userEventPublisher.Publish(userId.Value, "planned-workouts.updated", new { traineeId }, cancellationToken);
        }

        return Ok(result);
    }

    [HttpGet("{plannedWorkoutId:guid}")]
    public async Task<ActionResult<PlannedWorkoutResponse>> GetById(
        Guid traineeId,
        Guid plannedWorkoutId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPlannedWorkoutRequest
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId
        }, cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("{plannedWorkoutId:guid}")]
    public async Task<ActionResult<PlannedWorkoutResponse>> Update(Guid traineeId, Guid plannedWorkoutId, [FromBody] PlannedWorkoutRequest request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdatePlannedWorkoutCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
            Workout = request
        }, cancellationToken);

        var userId = await _userContext.GetUserId(cancellationToken);
        if (userId.HasValue)
        {
            await _userEventPublisher.Publish(userId.Value, "planned-workouts.updated", new { traineeId }, cancellationToken);
        }

        return Ok(result);
    }

    [HttpPut("{plannedWorkoutId:guid}/log")]
    public async Task<ActionResult<PlannedWorkoutResponse>> Log(
        Guid traineeId, Guid plannedWorkoutId, [FromBody] LogPlannedWorkoutRequest request)
    {
        var result = await _mediator.Send(new LogPlannedWorkoutCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
            Log = request
        });

        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{plannedWorkoutId:guid}")]
    public async Task<ActionResult> Delete(Guid traineeId, Guid plannedWorkoutId, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeletePlannedWorkoutCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId
        }, cancellationToken);

        var userId = await _userContext.GetUserId(cancellationToken);
        if (userId.HasValue)
        {
            await _userEventPublisher.Publish(userId.Value, "planned-workouts.updated", new { traineeId }, cancellationToken);
        }

        return NoContent();
    }

    [HttpGet("{plannedWorkoutId:guid}/chat-messages")]
    public async Task<ActionResult<ICollection<PlannedWorkoutChatMessageResponse>>> GetChatMessages(
        Guid traineeId,
        Guid plannedWorkoutId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetPlannedWorkoutChatMessagesRequest
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
        }, cancellationToken);

        return Ok(result);
    }

    [HttpPost("{plannedWorkoutId:guid}/chat-messages")]
    public async Task<ActionResult<PlannedWorkoutChatMessageResponse>> AddChatMessage(
        Guid traineeId,
        Guid plannedWorkoutId,
        [FromBody] PlannedWorkoutChatMessageRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new AddPlannedWorkoutChatMessageCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
            Message = request,
        }, cancellationToken);

        return result is null ? Forbid() : Ok(result);
    }

    [HttpPatch("{plannedWorkoutId:guid}/chat-messages/{chatMessageId:guid}")]
    public async Task<ActionResult<PlannedWorkoutChatMessageResponse>> UpdateChatMessage(
        Guid traineeId,
        Guid plannedWorkoutId,
        Guid chatMessageId,
        [FromBody] PlannedWorkoutChatMessageEditRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdatePlannedWorkoutChatMessageCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
            ChatMessageId = chatMessageId,
            Message = request,
        }, cancellationToken);

        return result is null ? Forbid() : Ok(result);
    }

    [HttpPost("{plannedWorkoutId:guid}/analysis")]
    public async Task<ActionResult<WorkoutMediaAnalysisResponse>> AnalyzeWorkoutMedia(
        Guid traineeId,
        Guid plannedWorkoutId,
        [FromBody] WorkoutMediaAnalysisRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new AnalyzeWorkoutMediaCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
            Analysis = request,
        }, cancellationToken);

        return result.Match<ActionResult<WorkoutMediaAnalysisResponse>>(
            success => Ok(success),
            _ => Forbid(),
            insufficient => UnprocessableEntity(new { error = insufficient.Reason }));
    }

    [HttpGet("{plannedWorkoutId:guid}/analysis/latest")]
    public async Task<ActionResult<WorkoutMediaAnalysisResponse?>> GetLatestWorkoutMediaAnalysis(
        Guid traineeId,
        Guid plannedWorkoutId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetLatestWorkoutMediaAnalysisRequest
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
        }, cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    private static GetPlannedWorkoutsRequest CreateGetRequest(
        Guid traineeId,
        DateOnly? from,
        DateOnly? to,
        string? next,
        int limit,
        string[] sortBy,
        SortOrder order,
        bool draftOnly)
    {
        return new GetPlannedWorkoutsRequest
        {
            TraineeId = traineeId,
            From = from,
            To = to,
            Limit = limit,
            SortBy = sortBy,
            Order = order,
            Cursor = Cursor.Parse<PlannedWorkoutCursor>(next),
            DraftOnly = draftOnly
        };
    }
}
