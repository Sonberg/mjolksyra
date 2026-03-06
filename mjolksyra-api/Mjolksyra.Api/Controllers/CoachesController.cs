using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Coaches.ApplyDiscountCode;
using Mjolksyra.UseCases.Coaches.GetAppliedDiscountCode;
using Mjolksyra.UseCases.Coaches.UpdateCoachPlan;

namespace Mjolksyra.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/coaches")]
public class CoachesController(IMediator mediator, IUserContext userContext) : ControllerBase
{
    [HttpGet("discout-code")]
    [HttpGet("discount-code")]
    public async Task<ActionResult<GetAppliedDiscountCodeResponse>> GetAppliedDiscountCode(CancellationToken ct)
    {
        var userId = await userContext.GetUserId(ct);
        if (userId is null) return Unauthorized();

        var response = await mediator.Send(new GetAppliedDiscountCodeQuery(userId.Value), ct);
        return Ok(response);
    }

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

    [HttpPut("plan")]
    public async Task<IActionResult> UpdatePlan(
        [FromBody] UpdateCoachPlanBody body,
        CancellationToken ct)
    {
        var userId = await userContext.GetUserId(ct);
        if (userId is null) return Unauthorized();

        await mediator.Send(new UpdateCoachPlanCommand(userId.Value, body.PlanId), ct);
        return Ok(new { success = true });
    }
}

public class UpdateCoachPlanBody
{
    public required Guid PlanId { get; set; }
}

public class ApplyDiscountCodeBody
{
    public required string Code { get; set; }
}
