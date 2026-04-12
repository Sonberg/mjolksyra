using MediatR;
using Mjolksyra.Domain.UserContext;

namespace Mjolksyra.UseCases.Admin.GetMediaIntegrity;

public class GetAttachmentIntegrityRequestHandler(
    IUserContext userContext,
    IAttachmentIntegrityReportService attachmentIntegrityReportService)
    : IRequestHandler<GetAttachmentIntegrityRequest, AttachmentIntegrityReportResponse>
{
    public async Task<AttachmentIntegrityReportResponse> Handle(GetAttachmentIntegrityRequest request, CancellationToken cancellationToken)
    {
        if (!await userContext.IsAdminAsync(cancellationToken))
        {
            throw new UnauthorizedAccessException();
        }

        return await attachmentIntegrityReportService.GenerateAsync(cancellationToken);
    }
}
