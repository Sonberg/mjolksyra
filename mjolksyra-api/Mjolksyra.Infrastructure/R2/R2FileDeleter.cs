using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Mjolksyra.Infrastructure.R2;

public class R2FileDeleter(IOptions<R2Options> options, ILogger<R2FileDeleter> logger) : IR2FileDeleter
{
    public async Task DeleteAsync(IEnumerable<string> keys, CancellationToken cancellationToken)
    {
        var keyList = keys.ToList();
        if (keyList.Count == 0) return;

        var opts = options.Value;
        using var client = CreateClient(opts);

        var request = new DeleteObjectsRequest
        {
            BucketName = opts.BucketName,
            Objects = keyList.Select(k => new KeyVersion { Key = k }).ToList(),
        };

        var response = await client.DeleteObjectsAsync(request, cancellationToken);

        if (response.DeleteErrors.Count > 0)
        {
            logger.LogWarning(
                "R2 deletion had {ErrorCount} error(s). First error: {Code} - {Message}",
                response.DeleteErrors.Count,
                response.DeleteErrors[0].Code,
                response.DeleteErrors[0].Message);
        }
    }

    private static AmazonS3Client CreateClient(R2Options opts)
    {
        var credentials = new BasicAWSCredentials(opts.AccessKeyId, opts.SecretAccessKey);
        var config = new AmazonS3Config
        {
            ServiceURL = $"https://{opts.AccountId}.r2.cloudflarestorage.com",
            ForcePathStyle = true,
        };
        return new AmazonS3Client(credentials, config);
    }
}
