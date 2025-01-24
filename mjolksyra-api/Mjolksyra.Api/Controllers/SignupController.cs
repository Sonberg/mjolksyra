using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Email;

namespace Mjolksyra.Api.Controllers;

[ApiController]
[Route("api/signup")]
public class SignupController : Controller
{
    private readonly IEmailSender _emailSender;

    public SignupController(IEmailSender emailSender)
    {
        _emailSender = emailSender;
    }

    [HttpPost]
    public async Task<IActionResult> Signup([FromBody] SignupRequest request, CancellationToken cancellationToken)
    {
        await _emailSender.SignUp(request.Email, cancellationToken);
        return NoContent();
    }
}

public class SignupRequest
{
    public required string Email { get; set; }
}