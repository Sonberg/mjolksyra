using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Admin.GetAdminStats;
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
