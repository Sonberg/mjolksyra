using MediatR;
using Mjolksyra.Domain.Database;

namespace Mjolksyra.UseCases.Admin.UpdateFeedbackReportStatus;

public class UpdateFeedbackReportStatusCommandHandler(
    IFeedbackReportRepository feedbackReportRepository
) : IRequestHandler<UpdateFeedbackReportStatusCommand, UpdateFeedbackReportStatusResult>
{
    public async Task<UpdateFeedbackReportStatusResult> Handle(UpdateFeedbackReportStatusCommand request, CancellationToken cancellationToken)
    {
        var report = await feedbackReportRepository.UpdateStatus(request.Id, request.Status, cancellationToken);

        return new UpdateFeedbackReportStatusResult
        {
            Id = report.Id,
            Status = report.Status,
        };
    }
}
