using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.UseCases.Common.Models;
using Mjolksyra.UseCases.Exercises;
using Mjolksyra.UseCases.Exercises.SearchExercises;
using Mjolksyra.UseCases.Exercises.StarExercise;
using Mjolksyra.UseCases.Exercises.StarredExercises;

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
    public async Task<ActionResult<PaginatedResponse<ExerciseResponse>>> Search([FromBody] SearchExercisesRequest request, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(request, cancellationToken));
    }

    [HttpGet("starred")]
    public async Task<ActionResult<PaginatedResponse<ExerciseResponse>>> Starred(CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new StarredExercisesRequest(), cancellationToken));
    }

    [HttpPut("{exerciseId:guid}/star")]
    public async Task<ActionResult> Star(Guid exerciseId, StarExerciseRequest request, CancellationToken cancellationToken)
    {
        return await _mediator
            .Send(request.ToCommand(exerciseId), cancellationToken)
            .ContinueWith(t => t.Result.Match<ActionResult>(
                _ => NoContent(),
                _ => BadRequest()
            ), cancellationToken);
    }


    // Get all exercises
    // Create exercise (add with user id)
    // Update exercise (only my exercises)
    // Delete exercise (only my exercises)
    // Search exercises
}