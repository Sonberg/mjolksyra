using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/trainee-invitations")]
public class TraineeInvitationsController : Controller
{
    private readonly IMediator _mediator;

    public TraineeInvitationsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        throw new NotImplementedException();
    }

    [HttpPut("{traineeInvitationId:guid}/accept")]
    public IActionResult Accept(Guid traineeInvitationId)
    {
        throw new NotImplementedException();
    }

    [HttpPut("{traineeInvitationId:guid}/decline")]
    public IActionResult Decline(Guid traineeInvitationId)
    {
        throw new NotImplementedException();
    }
}