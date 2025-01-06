using MediatR;
using Microsoft.AspNetCore.Mvc;

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
    public IActionResult GetAll()
    {
        throw new NotImplementedException();
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
}