using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Domain.Database;

public interface IFeedbackReportRepository
{
    Task<FeedbackReport> Create(FeedbackReport report, CancellationToken ct);

    Task<ICollection<FeedbackReport>> GetAll(CancellationToken ct);

    Task<FeedbackReport> UpdateStatus(Guid id, string status, CancellationToken ct);
}
