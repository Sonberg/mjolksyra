using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.UseCases.Trainees;
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

    [HttpPut("{traineeId:guid}")]
    public IActionResult Update(Guid traineeId)
    {
        throw new NotImplementedException();
    }

    [HttpPost("invite")]
    public IActionResult Invite()
    {
        throw new NotImplementedException();
    }

    [HttpPost]
    public async Task<ActionResult<TraineeResponse>> Create([FromBody] CreateTraineeCommand request, CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(request, cancellationToken));
    }
}