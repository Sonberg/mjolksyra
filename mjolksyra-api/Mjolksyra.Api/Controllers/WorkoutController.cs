using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.UseCases.Common.Models;
using Mjolksyra.UseCases.CompletedWorkouts;
using Mjolksyra.UseCases.CompletedWorkouts.GetWorkoutSession;
using Mjolksyra.UseCases.CompletedWorkouts.GetWorkouts;
using Mjolksyra.UseCases.CompletedWorkouts.LogWorkoutSession;
using Mjolksyra.UseCases.CompletedWorkouts.RestoreWorkoutSession;
using Mjolksyra.UseCases.CompletedWorkouts.StartWorkoutSession;
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
    public async Task<ActionResult<PaginatedResponse<WorkoutResponse>>> GetWorkouts(
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
    public async Task<ActionResult<WorkoutResponse>> GetWorkout(
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
    public async Task<ActionResult<WorkoutResponse>> StartSession(
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

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<WorkoutResponse>> UpdateSession(
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
    public async Task<ActionResult<WorkoutResponse>> LogSession(
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
    public async Task<ActionResult<WorkoutResponse>> RestoreSession(
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
}
