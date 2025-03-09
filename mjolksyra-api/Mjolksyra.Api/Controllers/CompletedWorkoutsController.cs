using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/trainees/{traineeId}/completed-workouts")]
public class CompletedWorkoutsController : Controller
{
    private readonly IMediator _mediator;

    public CompletedWorkoutsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public IActionResult Create(Guid traineeId)
    {
        throw new NotImplementedException();
    }

    [HttpGet]
    public IActionResult Get(Guid traineeId)
    {
        throw new NotImplementedException();
    }

    // [HttpGet("{completedWorkoutId:guid}")]
    // public IActionResult Get(Guid traineeId, Guid completedWorkoutId)
    // {
    //     throw new NotImplementedException();
    // }

    [HttpPut("{completedWorkoutId:guid}")]
    public IActionResult Update(Guid traineeId, Guid completedWorkoutId)
    {
        throw new NotImplementedException();
    }

    [HttpDelete("{completedWorkoutId:guid}")]
    public IActionResult Delete(Guid traineeId, Guid completedWorkoutId)
    {
        throw new NotImplementedException();
    }
}