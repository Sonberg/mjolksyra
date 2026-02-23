using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Users;
using Mjolksyra.UseCases.Users.EnsureUser;

namespace Mjolksyra.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/users")]
public class UsersController : Controller
{
    private readonly IMediator _mediator;

    private readonly IUserContext _userContext;

    public UsersController(IMediator mediator, IUserContext userContext)
    {
        _mediator = mediator;
        _userContext = userContext;
    }

    [HttpPost("me")]
    public async Task<ActionResult<EnsureUserResponse>> EnsureUser(CancellationToken cancellationToken)
    {
        if (await _userContext.GetUser(cancellationToken) is not { } user)
        {
            return BadRequest();
        }

        var response = await _mediator.Send(new EnsureUserCommand
        {
            ClerkUserId = user.ClerkUserId!,
            Email = user.Email,
            GivenName = user.GivenName,
            FamilyName = user.FamilyName,
        }, cancellationToken);

        return Ok(response);
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserResponse>> GetUserMe(CancellationToken cancellationToken)
    {
        if (await _userContext.GetUser(cancellationToken) is not { } user)
        {
            return BadRequest();
        }

        var response = await _mediator.Send(new GetUserRequest
        {
            UserId = user.Id
        }, cancellationToken);

        return Ok(response);
    }
}