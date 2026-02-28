using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using MongoDB.Driver;

namespace Mjolksyra.Infrastructure.Database;

public class FeedbackReportRepository(IMongoDbContext context) : IFeedbackReportRepository
{
    public async Task<FeedbackReport> Create(FeedbackReport report, CancellationToken ct)
    {
        await context.FeedbackReports.InsertOneAsync(report, cancellationToken: ct);
        return report;
    }

    public async Task<ICollection<FeedbackReport>> GetAll(CancellationToken ct)
    {
        return await context.FeedbackReports
            .Find(Builders<FeedbackReport>.Filter.Empty)
            .SortByDescending(x => x.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<FeedbackReport> UpdateStatus(Guid id, string status, CancellationToken ct)
    {
        var update = Builders<FeedbackReport>.Update.Set(x => x.Status, status);
        return await context.FeedbackReports.FindOneAndUpdateAsync(
            x => x.Id == id,
            update,
            new FindOneAndUpdateOptions<FeedbackReport> { ReturnDocument = ReturnDocument.After },
            ct);
    }
}
