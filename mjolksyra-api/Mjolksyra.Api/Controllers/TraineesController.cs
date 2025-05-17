using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Trainees;
using Mjolksyra.UseCases.Trainees.CancelTrainee;
using Mjolksyra.UseCases.Trainees.ChargeTrainee;
using Mjolksyra.UseCases.Trainees.CreateTrainee;
using Mjolksyra.UseCases.Trainees.GetTraineeById;
using Mjolksyra.UseCases.Trainees.GetTrainees;
using Mjolksyra.UseCases.Trainees.UpdateTrianeeCost;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/trainees")]
public class TraineesController : Controller
{
    private readonly IMediator _mediator;

    private readonly IUserContext _userContext;

    public TraineesController(IMediator mediator, IUserContext userContext)
    {
        _mediator = mediator;
        _userContext = userContext;
    }

    [HttpGet]
    public async Task<ActionResult<ICollection<TraineeResponse>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetTraineesRequest(), cancellationToken));
    }

    [HttpPost("/cost/simulate")]
    public Task<SimulateTraineeCostResponse> CostSimulate(SimulateTraineeCostRequest request, CancellationToken cancellationToken)
    {
        return _mediator.Send(request, cancellationToken);
    }


    [HttpGet("{traineeId:guid}")]
    public async Task<ActionResult<TraineeResponse>> Get(Guid traineeId)
    {
        var trainee = await _mediator.Send(new GetTraineeByIdRequest
        {
            TraineeId = traineeId
        });

        if (trainee is null)
        {
            return NoContent();
        }

        return Ok(trainee);
    }

    [HttpPut("{traineeId:guid}/cancel")]
    public async Task Cancel(Guid traineeId, CancellationToken cancellationToken)
    {
        await _mediator.Send(new CancelTraineeRequest
        {
            TraineeId = traineeId,
            UserId = _userContext.UserId!.Value
        }, cancellationToken);
    }


    [HttpPut("{traineeId:guid}/cost")]
    public async Task UpdateCost(Guid traineeId, UpdateTraineeCostRequest request, CancellationToken cancellationToken)
    {
        await _mediator.Send(request.ToCommand(traineeId, _userContext.UserId!.Value), cancellationToken);
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