using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;

namespace Mjolksyra.Infrastructure.R2;

public class R2FileUploader(IOptions<R2Options> options) : IR2FileUploader
{
    public async Task<string> UploadAsync(Stream stream, string key, string contentType, CancellationToken cancellationToken)
    {
        var opts = options.Value;
        using var client = CreateClient(opts);

        var request = new PutObjectRequest
        {
            BucketName = opts.BucketName,
            Key = key,
            InputStream = stream,
            ContentType = contentType,
            DisablePayloadSigning = true,
        };

        await client.PutObjectAsync(request, cancellationToken);

        return $"{opts.PublicBaseUrl.TrimEnd('/')}/{key}";
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
