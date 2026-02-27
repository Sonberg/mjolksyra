using MediatR;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.TraineeInvitations;
using Mjolksyra.UseCases.TraineeInvitations.AcceptTraineeInvitation;
using Mjolksyra.UseCases.TraineeInvitations.DeclineTraineeInvitation;
using Mjolksyra.UseCases.TraineeInvitations.GetTraineeInvitations;
using Mjolksyra.UseCases.TraineeInvitations.InviteTrainee;
using System.Net;

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
        var result = await _mediator.Send(command, cancellationToken);
        
        return result.Match<ActionResult<TraineeInvitationsResponse>>(
            response => Ok(response),
            error => Problem(
                detail: error.Message,
                statusCode: GetStatusCode(error.Code),
                title: "Unable to send invitation"));
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

    private static int GetStatusCode(InviteTraineeErrorCode code)
    {
        return code switch
        {
            InviteTraineeErrorCode.InvalidMonthlyPrice => (int)HttpStatusCode.BadRequest,
            InviteTraineeErrorCode.AthleteNotFound => (int)HttpStatusCode.BadRequest,
            InviteTraineeErrorCode.RelationshipRequired => (int)HttpStatusCode.Forbidden,
            InviteTraineeErrorCode.PendingInviteAlreadyExists => (int)HttpStatusCode.Conflict,
            _ => (int)HttpStatusCode.BadRequest
        };
    }
}
