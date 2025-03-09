using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.TraineeInvitations.GetTraineeInvitations;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/trainee-invitations")]
public class TraineeInvitationsController : Controller
{
    private readonly IUserContext _userContext;

    private readonly IMediator _mediator;

    public TraineeInvitationsController(IUserContext userContext, IMediator mediator)
    {
        _userContext = userContext;
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<ActionResult<ICollection<TraineeInvitationsResponse>>> GetAll(CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetTraineeInvitationsRequest
        {
            UserId = _userContext.UserId!.Value
        }, cancellationToken));
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