using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Coaches.ApplyDiscountCode;

namespace Mjolksyra.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/coaches")]
public class CoachesController(IMediator mediator, IUserContext userContext) : ControllerBase
{
    [HttpPost("discount-code")]
    public async Task<IActionResult> ApplyDiscountCode(
        [FromBody] ApplyDiscountCodeBody body,
        CancellationToken ct)
    {
        var userId = await userContext.GetUserId(ct);
        if (userId is null) return Unauthorized();

        var result = await mediator.Send(new ApplyDiscountCodeCommand
        {
            UserId = userId.Value,
            Code = body.Code,
        }, ct);

        return result.Match<IActionResult>(
            _ => Ok(new { success = true }),
            _ => NotFound(new { error = "Discount code not found." }),
            _ => UnprocessableEntity(new { error = "Discount code is no longer valid." }));
    }
}

public class ApplyDiscountCodeBody
{
    public required string Code { get; set; }
}
