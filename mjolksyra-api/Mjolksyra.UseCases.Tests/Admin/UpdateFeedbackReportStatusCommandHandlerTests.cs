using Moq;
using Mjolksyra.Domain.Database;
using Mjolksyra.Domain.Database.Models;
using Mjolksyra.UseCases.Admin.UpdateFeedbackReportStatus;

namespace Mjolksyra.UseCases.Tests.Admin;

public class UpdateFeedbackReportStatusCommandHandlerTests
{
    [Fact]
    public async Task Handle_CallsUpdateStatusWithCorrectArgs_AndReturnsMappedResult()
    {
        var reportId = Guid.NewGuid();
        var updatedReport = new FeedbackReport
        {
            Id = reportId,
            UserId = Guid.NewGuid(),
            Email = "user@example.com",
            Message = "Test message",
            PageUrl = "/app",
            Status = "Resolved",
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var feedbackReportRepository = new Mock<IFeedbackReportRepository>();
        feedbackReportRepository
            .Setup(x => x.UpdateStatus(reportId, "Resolved", It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedReport);

        var sut = new UpdateFeedbackReportStatusCommandHandler(feedbackReportRepository.Object);

        var result = await sut.Handle(new UpdateFeedbackReportStatusCommand
        {
            Id = reportId,
            Status = "Resolved",
        }, CancellationToken.None);

        Assert.Equal(reportId, result.Id);
        Assert.Equal("Resolved", result.Status);
        feedbackReportRepository.Verify(
            x => x.UpdateStatus(reportId, "Resolved", It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WithNewStatus_CallsUpdateStatusWithNewStatus()
    {
        var reportId = Guid.NewGuid();
        var updatedReport = new FeedbackReport
        {
            Id = reportId,
            UserId = Guid.NewGuid(),
            Email = null,
            Message = "Another message",
            PageUrl = null,
            Status = "New",
            CreatedAt = DateTimeOffset.UtcNow,
        };

        var feedbackReportRepository = new Mock<IFeedbackReportRepository>();
        feedbackReportRepository
            .Setup(x => x.UpdateStatus(reportId, "New", It.IsAny<CancellationToken>()))
            .ReturnsAsync(updatedReport);

        var sut = new UpdateFeedbackReportStatusCommandHandler(feedbackReportRepository.Object);

        var result = await sut.Handle(new UpdateFeedbackReportStatusCommand
        {
            Id = reportId,
            Status = "New",
        }, CancellationToken.None);

        Assert.Equal("New", result.Status);
        feedbackReportRepository.Verify(
            x => x.UpdateStatus(reportId, "New", It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
