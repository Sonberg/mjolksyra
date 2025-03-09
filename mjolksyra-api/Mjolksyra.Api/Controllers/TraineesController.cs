using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.UseCases.Trainees;
using Mjolksyra.UseCases.Trainees.ChargeTrainee;
using Mjolksyra.UseCases.Trainees.CreateTrainee;
using Mjolksyra.UseCases.Trainees.GetTrainees;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/trainees")]
public class TraineesController : Controller
{
    private readonly IMediator _mediator;

    public TraineesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ICollection<TraineeResponse>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetTraineesRequest(), cancellationToken));
    }

    [HttpGet("{traineeId:guid}")]
    public IActionResult Get(Guid traineeId)
    {
        throw new NotImplementedException();
    }

    [HttpPut("{traineeId:guid}/cancel")]
    public IActionResult Cancel(Guid traineeId)
    {
        throw new NotImplementedException();
    }


    [HttpPut("{traineeId:guid}/cost")]
    public IActionResult CostUpdate(Guid traineeId)
    {
        throw new NotImplementedException();
    }

    [HttpPost("{traineeId:guid}/cost/simulate")]
    public IActionResult CostSimulate(Guid traineeId)
    {
        throw new NotImplementedException();
    }

    [HttpPost("{traineeId:guid}/charge")]
    public async Task<IActionResult> Charge(Guid traineeId, CancellationToken cancellationToken)
    {
        await _mediator.Send(new ChargeTraineeRequest
        {
            TraineeId = traineeId
        }, cancellationToken);

        return Ok();
    }

    [HttpPost]
    public async Task<ActionResult<TraineeResponse>> Create([FromBody] CreateTraineeCommand request, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(request, cancellationToken));
    }
}