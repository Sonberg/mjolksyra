using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Admin.GetFeedbackReports;

public class GetFeedbackReportsRequestHandler(
    IFeedbackReportRepository feedbackReportRepository
) : IRequestHandler<GetFeedbackReportsRequest, ICollection<FeedbackReportItem>>
{
    public async Task<ICollection<FeedbackReportItem>> Handle(GetFeedbackReportsRequest request, CancellationToken cancellationToken)
    {
        var reports = await feedbackReportRepository.GetAll(cancellationToken);

        return reports.Select(r => new FeedbackReportItem
        {
            Id = r.Id,
            UserId = r.UserId,
            Email = r.Email,
            Message = r.Message,
            PageUrl = r.PageUrl,
            Status = r.Status,
            CreatedAt = r.CreatedAt,
        }).ToList();
    }
}
