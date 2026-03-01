using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.UseCases.Blocks;
using Mjolksyra.UseCases.Blocks.ApplyBlock;
using Mjolksyra.UseCases.Blocks.CreateBlock;
using Mjolksyra.UseCases.Blocks.DeleteBlock;
using Mjolksyra.UseCases.Blocks.GetBlock;
using Mjolksyra.UseCases.Blocks.GetBlocks;
using Mjolksyra.UseCases.Blocks.UpdateBlock;
using Zeta;
using Zeta.AspNetCore;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/blocks")]
public class BlocksController : Controller
{
    private readonly IMediator _mediator;
    private readonly IZetaValidator _validator;

    private static readonly ISchema<BlockWorkoutRequest> BlockWorkoutSchema = Z.Object<BlockWorkoutRequest>()
        .Field(x => x.DayOfWeek, Z.Int().Min(1).Max(7));

    private static readonly ISchema<BlockRequest> BlockRequestSchema = Z.Object<BlockRequest>()
        .Field(x => x.Name, Z.String().NotEmpty())
        .Field(x => x.NumberOfWeeks, Z.Int().Min(1))
        .Field(x => x.Workouts, workouts => workouts.Each(BlockWorkoutSchema));

    public BlocksController(IMediator mediator, IZetaValidator validator)
    {
        _mediator = mediator;
        _validator = validator;
    }

    [HttpGet]
    public async Task<ActionResult<ICollection<BlockResponse>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetBlocksRequest(), cancellationToken));
    }

    [HttpGet("{blockId:guid}")]
    public async Task<ActionResult<BlockResponse>> Get(Guid blockId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetBlockRequest
        {
            BlockId = blockId
        }, cancellationToken);

        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<BlockResponse>> Create([FromBody] BlockRequest request)
    {
        RemoveOverflowingWeeks(request);
        var validationResult = await _validator.ValidateAsync(request, BlockRequestSchema);
        if (validationResult.IsFailure)
        {
            return new BadRequestObjectResult(new ValidationProblemDetails(
                validationResult.Errors.GroupBy(e => e.Path)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.Message).ToArray())
            ));
        }

        return Ok(await _mediator.Send(new CreateBlockCommand
        {
            Block = validationResult.Value
        }));
    }

    [HttpPut("{blockId:guid}")]
    public async Task<ActionResult<BlockResponse>> Update(Guid blockId, [FromBody] BlockRequest request)
    {
        RemoveOverflowingWeeks(request);
        var validationResult = await _validator.ValidateAsync(request, BlockRequestSchema);
        if (validationResult.IsFailure)
        {
            return new BadRequestObjectResult(new ValidationProblemDetails(
                validationResult.Errors.GroupBy(e => e.Path)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.Message).ToArray())
            ));
        }

        var result = await _mediator.Send(new UpdateBlockCommand
        {
            BlockId = blockId,
            Block = validationResult.Value
        });

        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpDelete("{blockId:guid}")]
    public async Task<ActionResult> Delete(Guid blockId)
    {
        await _mediator.Send(new DeleteBlockCommand
        {
            BlockId = blockId
        });

        return NoContent();
    }

    [HttpPost("{blockId:guid}/apply")]
    public async Task<ActionResult> Apply(Guid blockId, [FromBody] ApplyBlockRequest request)
    {
        await _mediator.Send(new ApplyBlockCommand
        {
            BlockId = blockId,
            TraineeId = request.TraineeId,
            StartDate = request.StartDate
        });

        return NoContent();
    }

    private static void RemoveOverflowingWeeks(BlockRequest request)
    {
        request.Workouts = request.Workouts
            .Where(x => x.Week >= 1 && x.Week <= request.NumberOfWeeks)
            .ToList();
    }
}

public class ApplyBlockRequest
{
    public Guid TraineeId { get; set; }

    public DateOnly StartDate { get; set; }
}