using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.UseCases.Common.Models;
using Mjolksyra.UseCases.Exercises;
using Mjolksyra.UseCases.Exercises.CreateExercise;
using Mjolksyra.UseCases.Exercises.DeleteExercise;
using Mjolksyra.UseCases.Exercises.GetExercises;
using Mjolksyra.UseCases.Exercises.SearchExercises;
using Mjolksyra.UseCases.Exercises.StarExercise;
using Mjolksyra.UseCases.Exercises.StarredExercises;

namespace Mjolksyra.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/exercises")]
public class ExercisesController : Controller
{
    private readonly IMediator _mediator;

    private readonly IExerciseRepository _exerciseRepository;

    public ExercisesController(IMediator mediator, IExerciseRepository exerciseRepository)
    {
        _mediator = mediator;
        _exerciseRepository = exerciseRepository;
    }

    [HttpPost]
    public async Task<ActionResult<ExerciseResponse>> Create([FromBody] CreateExerciseCommand request, CancellationToken cancellationToken)
    {
        return await _mediator
            .Send(request, cancellationToken)
            .ContinueWith(t => t.Result.Match<ActionResult>(Ok, _ => BadRequest()), cancellationToken);
    }

    [HttpPost("search")]
    public async Task<ActionResult<PaginatedResponse<ExerciseResponse>>> Search([FromBody] SearchExercisesRequest request, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(request, cancellationToken));
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<ExerciseResponse>>> Get([FromQuery] string? cursor, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetExercisesRequest
        {
            Cursor = cursor != null ? Cursor.Parse(cursor) : null,
            Limit = 20
        }, cancellationToken));
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

    [HttpDelete("{exerciseId:guid}")]
    public async Task<ActionResult<ExerciseResponse>> Delete(Guid exerciseId, CancellationToken cancellationToken)
    {
        return await _mediator
            .Send(new DeleteExerciseCommand
            {
                ExerciseId = exerciseId
            }, cancellationToken)
            .ContinueWith(_ => NoContent(), cancellationToken);
    }

    [HttpGet("options")]
    public async Task<ActionResult> Options(CancellationToken cancellationToken)
    {
        return Ok(await _exerciseRepository.Options(cancellationToken));
    }
    
    // Update exercise (only my exercises)
}