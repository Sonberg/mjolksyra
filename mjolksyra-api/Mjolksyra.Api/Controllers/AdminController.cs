using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Admin.CreateDiscountCode;
using Mjolksyra.UseCases.Admin.GetAdminStats;
using Mjolksyra.UseCases.Admin.GetCoachRevenue;
using Mjolksyra.UseCases.Admin.GetDiscountCodes;
using Mjolksyra.UseCases.Admin.GetFeedbackReports;
using Mjolksyra.UseCases.Admin.GetMediaIntegrity;
using Mjolksyra.UseCases.Admin.GrantCoachCredits;
using Mjolksyra.UseCases.Admin.UpdateFeedbackReportStatus;
using Mjolksyra.UseCases.Coaches.EnsureCoachPlatformSubscription;
using Mjolksyra.UseCases.Trainees.TriggerMissingSubscriptionsForUser;

namespace Mjolksyra.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/admin")]
public class AdminController(IMediator mediator, IUserContext userContext, IUserRepository userRepository) : ControllerBase
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

    [HttpGet("attachment-integrity")]
    public async Task<ActionResult<AttachmentIntegrityReportResponse>> GetAttachmentIntegrity(CancellationToken ct)
    {
        if (!await userContext.IsAdminAsync(ct)) return Forbid();

        var result = await mediator.Send(new GetAttachmentIntegrityRequest(), ct);
        return Ok(result);
    }

    [HttpPost("coaches/{coachUserId:guid}/sync-subscriptions")]
    public async Task<ActionResult> EnsureCoachPlatformSubscription(Guid coachUserId, CancellationToken ct)
    {
        if (!await userContext.IsAdminAsync(ct)) return Forbid();

        await mediator.Send(new EnsureCoachPlatformSubscriptionCommand(coachUserId), ct);
        return Ok();
    }

    [HttpPost("coaches/ensure-platform-subscriptions")]
    public async Task<ActionResult<EnsureAllCoachPlatformSubscriptionsResult>> EnsureAllCoachPlatformSubscriptions(CancellationToken ct)
    {
        if (!await userContext.IsAdminAsync(ct)) return Forbid();

        var coaches = await userRepository.GetCoachUsersAsync(ct);
        var success = 0;
        var failed = 0;
        var errors = new List<string>();

        foreach (var coach in coaches)
        {
            try
            {
                await mediator.Send(new EnsureCoachPlatformSubscriptionCommand(coach.Id), ct);
                success++;
            }
            catch (Exception ex)
            {
                failed++;
                errors.Add($"{coach.Email.Value}: {ex.Message}");
            }
        }

        return Ok(new EnsureAllCoachPlatformSubscriptionsResult
        {
            Total = coaches.Count,
            Success = success,
            Failed = failed,
            Errors = errors
        });
    }

    [HttpPost("athletes/{athleteUserId:guid}/sync-subscriptions")]
    public async Task<ActionResult> TriggerMissingAthleteSubscriptions(Guid athleteUserId, CancellationToken ct)
    {
        if (!await userContext.IsAdminAsync(ct)) return Forbid();
        await mediator.Send(new TriggerMissingSubscriptionsForUserCommand(athleteUserId), ct);
        return Ok();
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

        if (body.Duration == DiscountDuration.Repeating &&
            (!body.DurationInMonths.HasValue || body.DurationInMonths.Value <= 0))
        {
            return BadRequest(new { title = "DurationInMonths must be set to a positive value for repeating discounts." });
        }

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

    [HttpPost("coaches/{coachUserId:guid}/credits/grant")]
    public async Task<ActionResult> GrantCoachCredits(
        Guid coachUserId,
        [FromBody] GrantCoachCreditsBody body,
        CancellationToken ct)
    {
        if (!await userContext.IsAdminAsync(ct)) return Forbid();

        if (body.PurchasedCredits <= 0)
        {
            return BadRequest(new { title = "PurchasedCredits must be greater than 0." });
        }

        await mediator.Send(new GrantCoachCreditsCommand(coachUserId, body.PurchasedCredits, body.Reason), ct);
        return Ok();
    }
}

public class UpdateFeedbackReportStatusBody
{
    public required string Status { get; set; }
}

public class CreateDiscountCodeBody
{
    public required string Code { get; set; }

    public string? Description { get; set; }

    public required DiscountType DiscountType { get; set; }

    public required int DiscountValue { get; set; }

    public required DiscountDuration Duration { get; set; }

    public int? DurationInMonths { get; set; }

    public int? MaxRedemptions { get; set; }
}

public class EnsureAllCoachPlatformSubscriptionsResult
{
    public required int Total { get; set; }
    public required int Success { get; set; }
    public required int Failed { get; set; }
    public required ICollection<string> Errors { get; set; }
}

public class GrantCoachCreditsBody
{
    public required int PurchasedCredits { get; set; }

    public string? Reason { get; set; }
}
