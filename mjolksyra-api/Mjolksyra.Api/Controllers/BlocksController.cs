using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.UseCases.Blocks;
using Mjolksyra.UseCases.Blocks.ApplyBlock;
using Mjolksyra.UseCases.Blocks.CreateBlock;
using Mjolksyra.UseCases.Blocks.DeleteBlock;
using Mjolksyra.UseCases.Blocks.GetBlock;
using Mjolksyra.UseCases.Blocks.GetBlocks;
using Mjolksyra.UseCases.Blocks.UpdateBlock;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/blocks")]
public class BlocksController : Controller
{
    private readonly IMediator _mediator;

    public BlocksController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ICollection<BlockResponse>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetBlocksRequest(), cancellationToken));
    }

    [HttpGet("{blockId:guid}")]
    public async Task<ActionResult<BlockResponse>> Get(Guid blockId, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetBlockRequest { BlockId = blockId }, cancellationToken);

        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<BlockResponse>> Create([FromBody] BlockRequest request)
    {
        return Ok(await _mediator.Send(new CreateBlockCommand { Block = request }));
    }

    [HttpPut("{blockId:guid}")]
    public async Task<ActionResult<BlockResponse>> Update(Guid blockId, [FromBody] BlockRequest request)
    {
        var result = await _mediator.Send(new UpdateBlockCommand
        {
            BlockId = blockId,
            Block = request
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
        await _mediator.Send(new DeleteBlockCommand { BlockId = blockId });

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
}

public class ApplyBlockRequest
{
    public Guid TraineeId { get; set; }

    public DateOnly StartDate { get; set; }
}
