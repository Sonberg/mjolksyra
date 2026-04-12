using Moq;
using Mjolksyra.Domain.UserContext;
using Mjolksyra.UseCases.Admin.GetMediaIntegrity;

namespace Mjolksyra.UseCases.Tests.Admin;

public class GetAttachmentIntegrityRequestHandlerTests
{
    [Fact]
    public async Task Handle_WhenUserIsAdmin_ReturnsReportFromService()
    {
        var expected = new AttachmentIntegrityReportResponse
        {
            GeneratedAt = DateTimeOffset.UtcNow,
            Summary = new AttachmentIntegritySummaryResponse
            {
                TotalReferencedMediaUrls = 10,
                TotalR2Objects = 12,
                OrphanObjectCount = 2,
                RawWithCompressedCount = 3,
                DeadReferenceCount = 1,
            },
        };

        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.IsAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var service = new Mock<IAttachmentIntegrityReportService>();
        service.Setup(x => x.GenerateAsync(It.IsAny<CancellationToken>())).ReturnsAsync(expected);

        var sut = new GetAttachmentIntegrityRequestHandler(userContext.Object, service.Object);

        var result = await sut.Handle(new GetAttachmentIntegrityRequest(), CancellationToken.None);

        Assert.Same(expected, result);
    }

    [Fact]
    public async Task Handle_WhenUserIsNotAdmin_ThrowsUnauthorized()
    {
        var userContext = new Mock<IUserContext>();
        userContext.Setup(x => x.IsAdminAsync(It.IsAny<CancellationToken>())).ReturnsAsync(false);

        var service = new Mock<IAttachmentIntegrityReportService>();

        var sut = new GetAttachmentIntegrityRequestHandler(userContext.Object, service.Object);

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            sut.Handle(new GetAttachmentIntegrityRequest(), CancellationToken.None));

        service.Verify(x => x.GenerateAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
