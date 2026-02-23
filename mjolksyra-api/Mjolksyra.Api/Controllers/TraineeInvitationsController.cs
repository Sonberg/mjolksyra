using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.TraineeInvitations;
using Mjolksyra.UseCases.TraineeInvitations.AcceptTraineeInvitation;
using Mjolksyra.UseCases.TraineeInvitations.DeclineTraineeInvitation;
using Mjolksyra.UseCases.TraineeInvitations.GetTraineeInvitations;
using Mjolksyra.UseCases.TraineeInvitations.InviteTrainee;

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

    [HttpGet("coach")]
    public async Task<ActionResult<ICollection<TraineeInvitationsResponse>>> GetCoach(CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetTraineeInvitationsRequest
        {
            UserId = await _userContext.GetUserId(cancellationToken).ContinueWith(x => x.Result!.Value, cancellationToken),
            Type = TraineeInvitationsType.Coach
        }, cancellationToken));
    }

    [HttpGet("athlete")]
    public async Task<ActionResult<ICollection<TraineeInvitationsResponse>>> GetAthlete(CancellationToken cancellationToken)
    {
        return Ok(await _mediator.Send(new GetTraineeInvitationsRequest
        {
            UserId = await _userContext.GetUserId(cancellationToken).ContinueWith(x => x.Result!.Value, cancellationToken),
            Type = TraineeInvitationsType.Athlete
        }, cancellationToken));
    }

    [HttpPost]
    public async Task<ActionResult<TraineeInvitationsResponse>> Invite(InviteTraineeRequest request, CancellationToken cancellationToken)
    {
        if (await _userContext.GetUserId(cancellationToken) is not { } userId)
        {
            return BadRequest();
        }

        var command = request.ToCommand(userId);
        return Ok(await _mediator.Send(command, cancellationToken));
    }


    [HttpPut("{traineeInvitationId:guid}/accept")]
    public async Task Accept(Guid traineeInvitationId, CancellationToken cancellationToken)
    {
        await _mediator.Send(new AcceptTraineeInvitationCommand
        {
            TraineeInvitationId = traineeInvitationId,
            AthleteUserId = await _userContext.GetUserId(cancellationToken).ContinueWith(x => x.Result!.Value, cancellationToken)
        }, cancellationToken);
    }

    [HttpPut("{traineeInvitationId:guid}/decline")]
    public async Task Decline(Guid traineeInvitationId, CancellationToken cancellationToken)
    {
        await _mediator.Send(new DeclineTraineeInvitationCommand
        {
            TraineeInvitationId = traineeInvitationId,
            AthleteUserId = await _userContext.GetUserId(cancellationToken).ContinueWith(x => x.Result!.Value, cancellationToken)
        }, cancellationToken);
    }
}