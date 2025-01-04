using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.UseCases.Exercises.SearchExercises;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/exercises")]
public class ExercisesController : Controller
{
    private readonly IMediator _mediator;

    public ExercisesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("search")]
    public async Task<ActionResult<ICollection<ExerciseResponse>>> Search([FromBody] SearchExercisesRequest request, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(request, cancellationToken));
    }

    [HttpGet("liked")]
    public async Task<ActionResult<ICollection<ExerciseResponse>>> Liked([FromBody] SearchExercisesRequest request, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(request, cancellationToken));
    }

    [HttpGet("{id}/like")]
    public async Task<ActionResult> PutLike(SearchExercisesRequest request, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(request, cancellationToken));
    }


    // Get all exercises
    // Create exercise (add with user id)
    // Update exercise (only my exercises)
    // Delete exercise (only my exercises)
    // Search exercises
}