using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/feedback-reports")]
public class FeedbackReportsController(
    IUserContext userContext,
    IFeedbackReportRepository feedbackReportRepository
) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<FeedbackReportResponse>> Create(
        [FromBody] CreateFeedbackReportRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest("Message is required.");
        }

        var user = await userContext.GetUser(cancellationToken);
        if (user is null || user.Id == Guid.Empty)
        {
            return BadRequest();
        }

        var report = await feedbackReportRepository.Create(new FeedbackReport
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Email = user.Email?.Value,
            Message = request.Message.Trim(),
            PageUrl = string.IsNullOrWhiteSpace(request.PageUrl) ? null : request.PageUrl.Trim(),
            Status = "New",
            CreatedAt = DateTimeOffset.UtcNow
        }, cancellationToken);

        return Ok(new FeedbackReportResponse
        {
            Id = report.Id,
            Status = report.Status,
            CreatedAt = report.CreatedAt
        });
    }
}

public class CreateFeedbackReportRequest
{
    public required string Message { get; set; }

    public string? PageUrl { get; set; }
}

public class FeedbackReportResponse
{
    public required Guid Id { get; set; }

    public required string Status { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }
}
