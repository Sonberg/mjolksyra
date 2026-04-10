using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.UseCases.CompletedWorkouts;
using Mjolksyra.UseCases.CompletedWorkouts.GetWorkoutSession;
using Mjolksyra.UseCases.CompletedWorkouts.LogWorkoutSession;
using Mjolksyra.UseCases.CompletedWorkouts.RestoreWorkoutSession;
using Mjolksyra.UseCases.CompletedWorkouts.StartWorkoutSession;
using Mjolksyra.UseCases.CompletedWorkouts.UpdateWorkoutSession;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/trainees/{traineeId:guid}/planned-workouts/{plannedWorkoutId:guid}/session")]
public class CompletedWorkoutsController : Controller
{
    private readonly IMediator _mediator;

    public CompletedWorkoutsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<CompletedWorkoutResponse>> GetSession(
        Guid traineeId,
        Guid plannedWorkoutId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetWorkoutSessionRequest
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
        }, cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CompletedWorkoutResponse>> StartSession(
        Guid traineeId,
        Guid plannedWorkoutId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new StartWorkoutSessionCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
        }, cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut]
    public async Task<ActionResult<CompletedWorkoutResponse>> UpdateSession(
        Guid traineeId,
        Guid plannedWorkoutId,
        [FromBody] UpdateWorkoutSessionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new UpdateWorkoutSessionCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
            Session = request,
        }, cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    [HttpPut("log")]
    public async Task<ActionResult<CompletedWorkoutResponse>> LogSession(
        Guid traineeId,
        Guid plannedWorkoutId,
        [FromBody] LogWorkoutSessionRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new LogWorkoutSessionCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
            Log = request,
        }, cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("restore")]
    public async Task<ActionResult<CompletedWorkoutResponse>> RestoreSession(
        Guid traineeId,
        Guid plannedWorkoutId,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new RestoreWorkoutSessionCommand
        {
            TraineeId = traineeId,
            PlannedWorkoutId = plannedWorkoutId,
        }, cancellationToken);

        return result is null ? NotFound() : Ok(result);
    }
}
