using MediatR;

namespace Mjolksyra.UseCases.Admin.GetMediaIntegrity;

public class GetAttachmentIntegrityRequest : IRequest<AttachmentIntegrityReportResponse>;

public interface IAttachmentIntegrityReportService
{
    Task<AttachmentIntegrityReportResponse> GenerateAsync(CancellationToken cancellationToken);
}

public class AttachmentIntegrityReportResponse
{
    public required DateTimeOffset GeneratedAt { get; set; }
    public required AttachmentIntegritySummaryResponse Summary { get; set; }
    public ICollection<OrphanMediaObjectResponse> OrphanObjects { get; set; } = [];
    public ICollection<RawWithCompressedResponse> RawWithCompressed { get; set; } = [];
    public ICollection<DeadMediaReferenceResponse> DeadReferences { get; set; } = [];
}

public class AttachmentIntegritySummaryResponse
{
    public required int TotalReferencedMediaUrls { get; set; }
    public required int TotalR2Objects { get; set; }
    public required int OrphanObjectCount { get; set; }
    public required int RawWithCompressedCount { get; set; }
    public required int DeadReferenceCount { get; set; }
}

public class OrphanMediaObjectResponse
{
    public required string Key { get; set; }
    public long SizeBytes { get; set; }
    public DateTimeOffset? LastModifiedAt { get; set; }
}

public class RawWithCompressedResponse
{
    public required string SourceType { get; set; }
    public required Guid TraineeId { get; set; }
    public required string OwnerId { get; set; }
    public required string RawUrl { get; set; }
    public required string RawKey { get; set; }
    public required string CompressedUrl { get; set; }
    public required string CompressedKey { get; set; }
}

public class DeadMediaReferenceResponse
{
    public required string SourceType { get; set; }
    public required Guid TraineeId { get; set; }
    public required string OwnerId { get; set; }
    public required string Url { get; set; }
    public string? Key { get; set; }
    public required string Reason { get; set; }
}
