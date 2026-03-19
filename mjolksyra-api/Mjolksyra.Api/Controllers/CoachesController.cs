using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Coaches.ApplyDiscountCode;
using Mjolksyra.UseCases.Coaches.ConsumeAiCredits;
using Mjolksyra.UseCases.Coaches.GetAiCredits;
using Mjolksyra.UseCases.Coaches.GetAppliedDiscountCode;
using Mjolksyra.UseCases.Coaches.PurchaseAiCreditPack;
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

    [HttpGet("ai-credits")]
    public async Task<ActionResult<GetAiCreditsResponse>> GetAiCredits(CancellationToken ct)
    {
        var userId = await userContext.GetUserId(ct);
        if (userId is null) return Unauthorized();

        var response = await mediator.Send(new GetAiCreditsQuery(userId.Value), ct);
        if (response is null) return Ok(new GetAiCreditsResponse { IncludedRemaining = 0, PurchasedRemaining = 0, TotalRemaining = 0 });
        return Ok(response);
    }

    [HttpPost("ai-credits/consume")]
    public async Task<IActionResult> ConsumeAiCredits(
        [FromBody] ConsumeAiCreditsBody body,
        CancellationToken ct)
    {
        var userId = await userContext.GetUserId(ct);
        if (userId is null) return Unauthorized();

        var result = await mediator.Send(new ConsumeAiCreditsCommand(userId.Value, body.Action, body.ReferenceId), ct);

        return result.Match<IActionResult>(
            success => Ok(new { remainingIncluded = success.RemainingIncluded, remainingPurchased = success.RemainingPurchased }),
            error => UnprocessableEntity(new { error = error.Reason }));
    }

    [HttpPost("ai-credits/purchase")]
    public async Task<IActionResult> PurchaseAiCreditPack(
        [FromBody] PurchaseAiCreditPackBody body,
        CancellationToken ct)
    {
        var userId = await userContext.GetUserId(ct);
        if (userId is null) return Unauthorized();

        var result = await mediator.Send(new PurchaseAiCreditPackCommand(userId.Value, body.PackId), ct);

        return result.Match<IActionResult>(
            _ => Ok(new { success = true }),
            error => UnprocessableEntity(new { error = error.Reason }));
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

public class ConsumeAiCreditsBody
{
    public required Mjolksyra.Domain.Database.Enum.AiCreditAction Action { get; set; }
    public string? ReferenceId { get; set; }
}

public class PurchaseAiCreditPackBody
{
    public required Guid PackId { get; set; }
}
