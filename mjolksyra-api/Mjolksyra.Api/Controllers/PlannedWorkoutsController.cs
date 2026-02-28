using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Enum;
using Mjolksyra.UseCases.Common.Models;
using Mjolksyra.UseCases.PlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.CreatePlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.DeletePlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkout;
using Mjolksyra.UseCases.PlannedWorkouts.GetPlannedWorkouts;
using Mjolksyra.UseCases.PlannedWorkouts.UpdatePlannedWorkout;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/trainees/{traineeId:guid}/planned-workouts")]
public class PlannedWorkoutsController : Controller
{
    private readonly IMediator _mediator;

    public PlannedWorkoutsController(IMediator mediator)
    {
        _mediator = mediator;
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
        return Ok(await _mediator.Send(new GetPlannedWorkoutsRequest
        {
            TraineeId = traineeId,
            From = from,
            To = to,
            Limit = limit,
            SortBy = sortBy,
            Order = order,
            Cursor = Cursor.Parse<PlannedWorkoutCursor>(next),
        }, cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<PlannedWorkoutResponse>> Create(Guid traineeId, [FromBody] PlannedWorkoutRequest request)
    {
        return Ok(await _mediator.Send(new CreatePlannedWorkoutCommand
        {
            TraineeId = traineeId,
            Workout = request
        }));
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
    public async Task<ActionResult<PlannedWorkoutResponse>> Update(Guid traineeId, Guid plannedWorkoutId, [FromBody] PlannedWorkoutRequest request)
    {
        return Ok(await _mediator.Send(new UpdatePlannedWorkoutCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
            Workout = request
        }));
    }

    [HttpDelete("{plannedWorkoutId:guid}")]
    public async Task<ActionResult> Delete(Guid traineeId, Guid plannedWorkoutId)
    {
        await _mediator.Send(new DeletePlannedWorkoutCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId
        });

        return NoContent();
    }
}
