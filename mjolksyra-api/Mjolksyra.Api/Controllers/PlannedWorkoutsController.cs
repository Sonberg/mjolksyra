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
using Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.PublishDraftExercises;

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

        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{plannedWorkoutId:guid}/exercises/publish")]
    public async Task<ActionResult<PlannedWorkoutResponse>> PublishDraftExercises(
        Guid traineeId,
        Guid plannedWorkoutId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new PublishDraftExercisesCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
        }, cancellationToken);

        var userId = await _userContext.GetUserId(cancellationToken);
        if (userId.HasValue)
        {
            await _userEventPublisher.Publish(userId.Value, "planned-workouts.updated", new { traineeId }, cancellationToken);
        }

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
