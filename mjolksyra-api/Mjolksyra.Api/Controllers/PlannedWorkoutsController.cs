using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/trainees/{traineeId}/planned-workouts")]
public class PlannedWorkoutsController : Controller
{
    private readonly IMediator _mediator;

    public PlannedWorkoutsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public IActionResult Get(Guid traineeId)
    {
        throw new NotImplementedException();
    }

    [HttpPost]
    public IActionResult Create(Guid traineeId)
    {
        throw new NotImplementedException();
    }

    [HttpGet("{plannedWorkoutId:guid}")]
    public IActionResult Get(Guid traineeId, Guid plannedWorkoutId)
    {
        throw new NotImplementedException();
    }

    [HttpPut("{plannedWorkoutId:guid}")]
    public IActionResult Update(Guid traineeId, Guid plannedWorkoutId)
    {
        throw new NotImplementedException();
    }

    [HttpDelete("{plannedWorkoutId:guid}")]
    public IActionResult Delete(Guid traineeId, Guid plannedWorkoutId)
    {
        throw new NotImplementedException();
    }
}