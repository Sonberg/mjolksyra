using System.Linq.Expressions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Database.Common;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Infrastructure.Database;
using Mjolksyra.UseCases.Common.Models;
using Mjolksyra.UseCases.Exercises;
using Mjolksyra.UseCases.Exercises.GetExercises;
using Mjolksyra.UseCases.Exercises.SearchExercises;
using Mjolksyra.UseCases.Exercises.StarExercise;
using Mjolksyra.UseCases.Exercises.StarredExercises;
using MongoDB.Driver;

namespace Mjolksyra.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/exercises")]
public class ExercisesController : Controller
{
    private readonly IMediator _mediator;

    private readonly IMongoDbContext _mongoDbContext;

    public ExercisesController(IMediator mediator, IMongoDbContext mongoDbContext)
    {
        _mediator = mediator;
        _mongoDbContext = mongoDbContext;
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

    [HttpGet("options")]
    public async Task<ActionResult> Options(CancellationToken cancellationToken)
    {
        var categoryCursor = await DistinctAsync(x => x.Category, cancellationToken);
        var equipmentCursor = await DistinctAsync(x => x.Equipment, cancellationToken);
        var forceCursor = await DistinctAsync(x => x.Force, cancellationToken);
        var levelCursor = await DistinctAsync(x => x.Level, cancellationToken);
        var mechanicCursor = await DistinctAsync(x => x.Mechanic, cancellationToken);

        return Ok(new
        {
            Category = await categoryCursor.ToListAsync(cancellationToken),
            Equipment = await equipmentCursor.ToListAsync(cancellationToken),
            Force = await forceCursor.ToListAsync(cancellationToken),
            Level = await levelCursor.ToListAsync(cancellationToken),
            Mechanic = await mechanicCursor.ToListAsync(cancellationToken)
        });
    }


    private Task<IAsyncCursor<string?>> DistinctAsync(Expression<Func<Exercise, string?>> selector, CancellationToken cancellationToken)
    {
        return _mongoDbContext.Exercises
            .DistinctAsync(
                selector,
                Builders<Exercise>.Filter.Ne(selector, null),
                cancellationToken: cancellationToken);
    }

    // Get all exercises
    // Create exercise (add with user id)
    // Update exercise (only my exercises)
    // Delete exercise (only my exercises)
    // Search exercises
}