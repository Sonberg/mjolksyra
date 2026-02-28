using MediatR;

namespace Mjolksyra.UseCases.Admin.UpdateFeedbackReportStatus;

public class UpdateFeedbackReportStatusCommand : IRequest<UpdateFeedbackReportStatusResult>
{
    public required Guid Id { get; set; }

    public required string Status { get; set; }
}

public class UpdateFeedbackReportStatusResult
{
    public required Guid Id { get; set; }

    public required string Status { get; set; }
}
