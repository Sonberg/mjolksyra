using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;

namespace Mjolksyra.Infrastructure.Database;

public class FeedbackReportRepository(IMongoDbContext context) : IFeedbackReportRepository
{
    public async Task<FeedbackReport> Create(FeedbackReport report, CancellationToken ct)
    {
        await context.FeedbackReports.InsertOneAsync(report, cancellationToken: ct);
        return report;
    }
}
