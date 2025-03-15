using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Users;

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

    [HttpGet("me")]
    public async Task<ActionResult<UserResponse>> GetUserMe()
    {
        if (_userContext.UserId is not { } userId)
        {
            return BadRequest();
        }

        var response = await _mediator.Send(new GetUserRequest
        {
            UserId = userId
        });

        return Ok(response);
    }
}