using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Trainees;
using Mjolksyra.UseCases.Trainees.CancelTrainee;
using Mjolksyra.UseCases.Trainees.ChargeNowTrainee;
using Mjolksyra.UseCases.Trainees.CreateTrainee;
using Mjolksyra.UseCases.Trainees.GetTraineeById;
using Mjolksyra.UseCases.Trainees.GetTrainees;
using Mjolksyra.UseCases.Trainees.UpdateTrianeeCost;
using System.Net;

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
            UserId = await _userContext.GetUserId(cancellationToken).ContinueWith(x => x.Result!.Value, cancellationToken)
        }, cancellationToken);
    }


    [HttpPut("{traineeId:guid}/cost")]
    public async Task UpdateCost(Guid traineeId, UpdateTraineeCostRequest request, CancellationToken cancellationToken)
    {
        await _mediator.Send(
            request.ToCommand(
                traineeId,
                await _userContext
                    .GetUserId(cancellationToken)
                    .ContinueWith(x => x.Result!.Value, cancellationToken)
            ),
            cancellationToken
        );
    }

    [HttpPost("{traineeId:guid}/charge-now")]
    public async Task ChargeNow(Guid traineeId, CancellationToken cancellationToken)
    {
        await _mediator.Send(new ChargeNowTraineeCommand
        {
            TraineeId = traineeId,
            UserId = await _userContext
                .GetUserId(cancellationToken)
                .ContinueWith(x => x.Result!.Value, cancellationToken)
        }, cancellationToken);
    }

    [HttpPost]
    public async Task<ActionResult<TraineeResponse>> Create([FromBody] CreateTraineeCommand request, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(request, cancellationToken);
        return result.Match<ActionResult<TraineeResponse>>(
            response => Ok(response),
            error => Problem(
                detail: error.Message,
                statusCode: GetStatusCode(error.Code),
                title: "Unable to create trainee"));
    }

    private static int GetStatusCode(CreateTraineeErrorCode code)
    {
        return code switch
        {
            CreateTraineeErrorCode.AlreadyConnected => (int)HttpStatusCode.Conflict,
            _ => (int)HttpStatusCode.BadRequest
        };
    }
}
