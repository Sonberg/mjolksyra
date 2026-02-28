using MediatR;

namespace Mjolksyra.UseCases.Admin.GetFeedbackReports;

public class GetFeedbackReportsRequest : IRequest<ICollection<FeedbackReportItem>>
{
}

public class FeedbackReportItem
{
    public required Guid Id { get; set; }

    public required Guid UserId { get; set; }

    public required string? Email { get; set; }

    public required string Message { get; set; }

    public required string? PageUrl { get; set; }

    public required string Status { get; set; }

    public required DateTimeOffset CreatedAt { get; set; }
}
