using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IFeedbackReportRepository
{
    Task<FeedbackReport> Create(FeedbackReport report, CancellationToken ct);
}
