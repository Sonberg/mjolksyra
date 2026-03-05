using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Admin.CreateDiscountCode;
using Mjolksyra.UseCases.Admin.GetAdminStats;
using Mjolksyra.UseCases.Admin.GetCoachRevenue;
using Mjolksyra.UseCases.Admin.GetDiscountCodes;
using Mjolksyra.UseCases.Admin.GetFeedbackReports;
using Mjolksyra.UseCases.Admin.UpdateFeedbackReportStatus;

namespace Mjolksyra.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/admin")]
public class AdminController(IMediator mediator, IUserContext userContext) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsResponse>> GetStats(CancellationToken ct)
    {
        if (!await userContext.IsAdminAsync(ct)) return Forbid();

        var result = await mediator.Send(new GetAdminStatsRequest(), ct);
        return Ok(result);
    }

    [HttpGet("feedback-reports")]
    public async Task<ActionResult<ICollection<FeedbackReportItem>>> GetFeedbackReports(CancellationToken ct)
    {
        if (!await userContext.IsAdminAsync(ct)) return Forbid();

        var result = await mediator.Send(new GetFeedbackReportsRequest(), ct);
        return Ok(result);
    }

    [HttpGet("coaches/revenue")]
    public async Task<ActionResult<ICollection<CoachRevenueItem>>> GetCoachRevenue(CancellationToken ct)
    {
        if (!await userContext.IsAdminAsync(ct)) return Forbid();

        var result = await mediator.Send(new GetCoachRevenueRequest(), ct);
        return Ok(result);
    }

    [HttpGet("discount-codes")]
    public async Task<ActionResult<ICollection<DiscountCodeItem>>> GetDiscountCodes(CancellationToken ct)
    {
        if (!await userContext.IsAdminAsync(ct)) return Forbid();

        var result = await mediator.Send(new GetDiscountCodesRequest(), ct);
        return Ok(result);
    }

    [HttpPost("discount-codes")]
    public async Task<ActionResult<CreateDiscountCodeResult>> CreateDiscountCode(
        [FromBody] CreateDiscountCodeBody body,
        CancellationToken ct)
    {
        if (!await userContext.IsAdminAsync(ct)) return Forbid();

        var result = await mediator.Send(new CreateDiscountCodeCommand
        {
            Code = body.Code,
            Description = body.Description,
            DiscountType = body.DiscountType,
            DiscountValue = body.DiscountValue,
            Duration = body.Duration,
            DurationInMonths = body.DurationInMonths,
            MaxRedemptions = body.MaxRedemptions,
        }, ct);

        return Ok(result);
    }

    [HttpPatch("feedback-reports/{id:guid}/status")]
    public async Task<ActionResult<UpdateFeedbackReportStatusResult>> UpdateFeedbackReportStatus(
        Guid id,
        [FromBody] UpdateFeedbackReportStatusBody body,
        CancellationToken ct)
    {
        if (!await userContext.IsAdminAsync(ct)) return Forbid();

        var result = await mediator.Send(new UpdateFeedbackReportStatusCommand
        {
            Id = id,
            Status = body.Status,
        }, ct);

        return Ok(result);
    }
}

public class UpdateFeedbackReportStatusBody
{
    public required string Status { get; set; }
}

public class CreateDiscountCodeBody
{
    public required string Code { get; set; }

    public required string Description { get; set; }

    public required DiscountType DiscountType { get; set; }

    public required int DiscountValue { get; set; }

    public required DiscountDuration Duration { get; set; }

    public int? DurationInMonths { get; set; }

    public int? MaxRedemptions { get; set; }
}
